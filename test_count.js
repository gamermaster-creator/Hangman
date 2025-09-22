// Node test script to verify Thai placeholder counting

function decomposeThai(cluster) {
    const leftVowels = ['\u0E40','\u0E41','\u0E42','\u0E43','\u0E44'];
    const topMarks = [
        '\u0E31', '\u0E34', '\u0E35', '\u0E36', '\u0E37', '\u0E47', '\u0E4D', '\u0E4C', '\u0E33'
    ];
    const toneMarks = ['\u0E48','\u0E49','\u0E4A','\u0E4B'];
    const bottomMarks = ['\u0E38','\u0E39','\u0E3A','\u0E4E'];

    let left = '';
    let top = '';
    let tone = '';
    let right = '';
    let consonant = '';
    let bottom = '';

    const chars = [...cluster];

    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (i === 0 && leftVowels.includes(ch)) {
            left += ch;
            continue;
        }
        if (topMarks.includes(ch)) {
            top += ch;
            continue;
        }
        if (toneMarks.includes(ch)) {
            tone += ch;
            continue;
        }
        const rightRange = ['\u0E30','\u0E32','\u0E33','\u0E34','\u0E35','\u0E36','\u0E37','\u0E38','\u0E39'];
        if (rightRange.includes(ch)) {
            right += ch;
            continue;
        }
        if (bottomMarks.includes(ch)) {
            bottom += ch;
            continue;
        }
        consonant += ch;
    }

    if (tone) top = tone + top;

    return {
        left: left ? [...left] : [],
        top: top ? [...top] : [],
        right: right ? [...right] : [],
        consonant,
        bottom: bottom ? [...bottom] : []
    };
}

function splitGraphemes(str) {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        return Array.from(seg.segment(str), s => s.segment);
    }

    const leftVowels = new Set(['\u0E40','\u0E41','\u0E42','\u0E43','\u0E44']);
    const combiningMark = /\p{M}/u;
    const chars = [...str];
    const clusters = [];
    let i = 0;
    while (i < chars.length) {
        const ch = chars[i];
        if (leftVowels.has(ch) && i + 1 < chars.length) {
            let cluster = ch + chars[i + 1];
            i += 2;
            while (i < chars.length && combiningMark.test(chars[i])) {
                cluster += chars[i];
                i++;
            }
            clusters.push(cluster);
            continue;
        }
        let cluster = ch;
        i++;
        while (i < chars.length && combiningMark.test(chars[i])) {
            cluster += chars[i];
            i++;
        }
        clusters.push(cluster);
    }
    return clusters;
}

function countPlaceholders(clusters) {
    let total = 0;
    const perCluster = clusters.map(cluster => {
        const parts = decomposeThai(cluster);
        let cnt = 0;
        if (parts.consonant && parts.consonant.trim() !== '') cnt++;
        cnt += parts.left.length;
        cnt += parts.top.length;
        cnt += parts.right.length;
        cnt += parts.bottom.length;
        total += cnt;
        return { cluster, parts, count: cnt };
    });
    return { total, perCluster };
}

const samples = ['เป็ด', 'บ้าน', 'น้องดาต้า'];

samples.forEach(s => {
    const w = s.normalize('NFC');
    const clusters = splitGraphemes(w);
    const breakdown = countPlaceholders(clusters);
    console.log(`SAMPLE "${s}": total=${breakdown.total}`);
    breakdown.perCluster.forEach(pc => {
        console.log(' - cluster:', pc.cluster, 'count:', pc.count, 'parts:', pc.parts);
    });
    console.log('---');
});
