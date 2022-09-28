const { exec } = require("child_process");
const fs = require("fs");
const parentDir = './mudancas_dsr';

// if (process.argv.length === 2) {
//     console.error('Expected at least one argument!');
//     process.exit(1);
// }

const params = [];

for (let i = 2; i < process.argv.length; i++) {
    params.push(process.argv[i])
}

const commitsHasDsrChanges = [];

console.log('A verificação já está ocorrendo!')

for (let i = 0; i < params.length; i++) {
    exec(`git show ${params[i]}`, async (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        const res = await stdout;
        const dsrCommit = res.match(/dsr#[a-f0-9]{40}/g);
        if (dsrCommit && dsrCommit.length) {
            const author = res.match(/([a-zA-Z0-9._-]|\s)+\s<([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)>/g);
            const parsedHash = dsrCommit.map(hash => hash.split('#')[1]);
            const removedDuplicates = [...new Set(parsedHash)]
            commitsHasDsrChanges.push({author, commit_front: params[i], commits_dsr: removedDuplicates});
        }
        if (i + 1 === params.length && commitsHasDsrChanges.length) {
            console.log(commitsHasDsrChanges);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir);
            }
            const date = new Date().toLocaleString('pt-BR').replace(/\//g, '-').replace(/\s/g, 'T').replace(/\:/g, '-');
            const fileName = `commits_com_mudancas_dsr_${date}.json`;
            fs.writeFile(`${parentDir}/${fileName}`, JSON.stringify(commitsHasDsrChanges), function (err) {
                if (err) throw err;
                console.log(`Existem commits com mudança no DSR. \nVeja em: ${parentDir}/${fileName}`);
            })
        } else {
            console.log('Não existem commits com mudanças no DSR');
        }
    });
}


