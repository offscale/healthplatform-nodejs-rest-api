import { readdir, statSync } from 'fs';
import * as path from 'path';
import { map } from 'async';

export const importDrSpocData = (searchPath: string,
                                 callback: (err: NodeJS.ErrnoException | null, files?: string[]) => void): void => {
    const filters = {
        R1: [73, 197, 198, 212, 426, 547, 652, 792, 841, 885, 981, 1014, 1039, 1054, 1061, 1072, 1130, 1157, 1202, 1212,
            1236, 1293, 1396, 1439, 1501, 1512, 1584, 1659, 1679, 1765, 2172, 2345, 2567, 2571, 2573, 2606, 2609, 2687,
            2717, 2761, 2768, 2804, 2833, 2858, 2876, 3109, 3202, 3255, 3544, 3587, 3767, 3837, 3869, 3871, 3942, 3999,
            4065, 4474, 4530, 4672, 4731, 4894, 5063, 5091, 5217, 5226, 5341, 5372, 5503, 5521, 5618, 5677, 5697, 5723,
            5756, 5912, 5926, 5989, 6050, 6087, 6146, 6306, 6345, 6350, 6493, 6498, 6522, 6529, 6555, 6699, 6707, 6960,
            7019, 7342, 7459, 7545, 7562, 7662, 7966, 8009, 8049, 8104, 8182, 8216, 8289, 8306, 8307, 8341, 8351, 8422,
            8431, 8436, 8636, 8789, 8812, 8877, 8897, 8947, 8953, 8965, 9018, 9066, 9132, 9321, 9326, 9605, 9644, 9689,
            9716, 9784, 9800, 9938, 9998].map(String),

        R2: [145, 166, 198, 202, 212, 263, 342, 426, 684, 699, 792, 920, 1014, 1022, 1039, 1061, 1072, 1130, 1157, 1163,
            1202, 1236, 1293, 1396, 1439, 1474, 1501, 1597, 1933, 1995, 2007, 2055, 2165, 2172, 2187, 2567, 2571, 2606,
            2675, 2717, 2723, 2761, 2787, 2804, 2833, 2858, 2876, 2951, 2971, 3054, 3109, 3159, 3202, 3255, 3359, 3385,
            3474, 3544, 3585, 3921, 3942, 3999, 4004, 4065, 4106, 4188, 4354, 4530, 4639, 4642, 4672, 4706, 4770, 4841,
            4850, 4910, 4961, 5063, 5100, 5112, 5182, 5226, 5251, 5341, 5372, 5386, 5392, 5474, 5490, 5503, 5618, 5660,
            5677, 5697, 5716, 5723, 5756, 5996, 6050, 6087, 6271, 6306, 6350, 6493, 6498, 6529, 6707, 6775, 6813, 6945,
            6960, 6974, 6998, 7019, 7042, 7211, 7276, 7281, 7303, 7342, 7459, 7648, 7662, 7767, 7940, 7966, 8004, 8010,
            8049, 8088, 8170, 8182, 8198, 8199, 8216, 8306, 8307, 8351, 8436, 8593, 8601, 8636, 8789, 8800, 8812, 8877,
            8881, 8884, 8897, 8953, 8965, 9018, 9063, 9066, 9277, 9301, 9326, 9425, 9784, 9938, 9998,].map(String),

        L1: [197, 212, 323, 334, 426, 792, 981, 1014, 1061, 1072, 1130, 1157, 1202, 1236, 1375, 1396, 1439, 1584, 1678,
            1679, 2007, 2350, 2573, 2574, 2665, 2768, 2787, 2811, 2876, 3159, 3186, 3202, 3359, 3544, 3567, 3587, 3638,
            3650, 3723, 3837, 3865, 3871, 3901, 4199, 4354, 4402, 4417, 4439, 4474, 4530, 4612, 4642, 4672, 4824, 4850,
            4852, 5008, 5014, 5051, 5063, 5217, 5341, 5372, 5490, 5618, 5677, 5697, 5716, 5723, 5756, 5881, 5924, 5930,
            5996, 6050, 6133, 6146, 6306, 6345, 6467, 6493, 6498, 6522, 6529, 6593, 6699, 6707, 6709, 6960, 6973, 7019,
            7024, 7091, 7211, 7342, 7459, 7545, 7562, 7648, 7662, 7700, 7767, 7940, 8009, 8049, 8158, 8170, 8198, 8202,
            8306, 8307, 8341, 8351, 8422, 8431, 8436, 8530, 8601, 8636, 8656, 8812, 8877, 8884, 8897, 8947, 8961, 8965,
            9060, 9218, 9321, 9616, 9648, 9689, 9784, 9998].map(String),

        L2: [50, 145, 166, 197, 263, 323, 342, 426, 547, 699, 792, 841, 920, 981, 1013, 1014, 1039, 1061, 1072, 1097,
            1157, 1163, 1202, 1236, 1293, 1396, 1439, 1474, 1584, 1659, 1678, 1679, 1687, 1765, 1861, 1904, 1933, 1990,
            2172, 2179, 2187, 2492, 2571, 2573, 2574, 2665, 2787, 2804, 2811, 2858, 2865, 2876, 2971, 3109, 3159, 3172,
            3186, 3202, 3474, 3567, 3587, 3619, 3638, 3723, 3837, 3869, 3921, 4065, 4106, 4188, 4354, 4402, 4439, 4474,
            4530, 4606, 4612, 4639, 4642, 4672, 4706, 4770, 4850, 4852, 4961, 5014, 5059, 5063, 5100, 5166, 5182, 5226,
            5231, 5341, 5372, 5386, 5387, 5503, 5618, 5660, 5677, 5697, 5716, 5723, 5756, 5881, 5964, 6050, 6306, 6345,
            6350, 6467, 6493, 6498, 6529, 6775, 6813, 6960, 6998, 7019, 7091, 7173, 7306, 7342, 7459, 7545, 7611, 7629,
            7662, 7700, 7767, 7940, 7965, 8004, 8049, 8088, 8090, 8128, 8170, 8198, 8199, 8341, 8351, 8422, 8530, 8593,
            8601, 8636, 8656, 8877, 8884, 8897, 8953, 8965, 9060, 9063, 9277, 9301, 9425, 9644, 9784, 9938, 9998].map(String)
    };

    const all_values = new Set(Object.values(filters).reduce((a, b) => a.concat(b), []));
    const all_keys = new Set(Object.keys(filters));

    const parseFileName = (fname: string): {location: string, pid: string} => {
        let [buffer, location, pid, last_char] = ['', '', '', ''];
        for (let i = 0; i < fname.length; i++) {
            location = last_char + fname[i];
            if (all_keys.has(location)) {
                location = last_char + fname[i];
                pid = buffer.slice(0, i - 1);
                buffer = '';
                break;
            }
            buffer += fname[i];
            last_char = fname[i];
        }

        if (pid.length === 0) console.warn(`Unable to parse: ${fname}`);

        return { location, pid };
    };

    const s = (p: string, callback: (err: NodeJS.ErrnoException | null, files?: string[]) => void): void => {
        readdir(p, (err, files) => {
            if (err != null) return callback(err);
            else if (files == null || !files.length) return callback(new Error('Expected files'));
            const base = path.basename(p);
            return callback(null,
                files
                    .map(file => [file, path.join(p, file)])
                    .filter((file_abs: string[]) => statSync(file_abs[1]).isFile())
                    .filter((file_abs: string[]) =>
                        ['.DS_Store', 'Thumbs.db', 'L1.PNG', 'L2.PNG', 'R1.PNG', 'R2.PNG'].indexOf(file_abs[0]) === -1
                    )
                    .filter((file_abs: string[]) => filters[parseFileName(file_abs[0]).location].indexOf(base) > -1)
                    .map((files_abs: string[]) => files_abs[1])
            )
        })
    };


    readdir(searchPath, (err, folders) => {
        if (err != null) throw err;
        else if (folders == null || !folders.length) throw new ReferenceError(`${searchPath} is empty`);

        map(folders
                .filter(folder => all_values.has(folder))
                .map(folder => path.join(searchPath, folder))
                .filter(abs_folder => statSync(abs_folder).isDirectory()),
            s,
            (errors, result) => {
                if (errors != null) return callback(errors);
                else if (result == null || !result.length) return callback(new Error('Expected a result'));
                return callback(null, (result as unknown as string[]).flat());
            })
    });
};

if (require.main === module) {
    importDrSpocData(process.env.SAMPLE_DATA_PATH!, (e, r) => {
        if (e != null) throw e;
        else if (r == null) throw TypeError('DrSpocData is null');
        console.info(r.map(o =>
            encodeURIComponent(o.replace(process.env.BASE_DIR_REPLACE!, process.env.BASE_DIR!))
        ).join('\n'));
    });
}

/*

printf '#!/usr/bin/env bash\n\n' > ~/data-upload.bash ;
env -i SAMPLE_DATA_PATH='DIR HERE' BASE_DIR_REPLACE='OTHER DIR HERE'
 BASE_DIR='BASE DIR HERE' PATH="$HOME"'/n/bin' node import_dr_spoc.js
  | xargs -I % bash -c
  'echo http POST :3000/api/artifact
   \"'"$at"'\" location=\"%\" contentType=\"image/jpeg\"' >> ~/data-upload.bash

*/
