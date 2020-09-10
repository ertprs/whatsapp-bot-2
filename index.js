const fs = require('fs');
const { Client, Location } = require('whatsapp-web.js');

const version = "v1.0.2-alpha"

const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({ puppeteer: { headless: false }, session: sessionCfg });

client.initialize();

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, {small: true});
});


client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});

// Command Handler
client.on('message', async msg => {
    console.log('MESSAGE RECEIVED', msg);

    if (msg.body == '!help') {
        msg.reply(`
*INFORMASI:*
*!groupinfo* - Menampilkan informasi tentang group ini.
*!botinfo* - Menampilkan informasi tentang bot ini
*!everyone* - Mention semua orang di group ini.

*INFORMASI PELAJARAN:*
*!absen.* - Menampilkan link-link absensi x-rpl.
*!nomorguru* - Menampilkan list nomor telpon guru-guru smkn-2`);

    } else if (msg.body == '!absen') {
        msg.reply(`
- *Absen Harian ( Setiap Hari )*
*https://forms.gle/D1DczHE41LQ6xRc9A*
        
- *Matematika ( Setiap Hari Senin )*
*https://docs.google.com/forms/d/e/1FAIpQLSc42WqV04nCBXtI7s0dZj7DQYISUCZGMMZK13mlD7_AY71naw/viewform*
        
- *Pemrogaman Dasar ( Setiap Hari Selasa )*
*https://docs.google.com/forms/d/e/1FAIpQLSfHsd8oH9a2JnmcWMfmKPtjUEWa74nPv1SDy-gKuLle4g1k3A/viewform*
        
- *Komputer dan Jaringan Dasar ( Setiap Hari Selasa )*
*https://forms.gle/MZx2SkaeTbJP5zcG7*
        
- *Simulasi dan Komunikasi Digital / Sistem Komputer ( Setiap Hari Rabu )*
*https://forms.gle/nx8dMEebDudhH5XR6*
        
-*Seni Budaya ( Setiap Hari Rabu )*
*https://docs.google.com/forms/d/e/1FAIpQLSeU2K9a4jQyULqCwTZQCD3MMz6RYHS75f7HArusNn21c0sRQQ/viewform?usp=sf_link*
        
- *Sejarah Indonesia ( Setiap Hari Rabu & Kamis)*
*https://docs.google.com/forms/d/e/1FAIpQLSf093V62QeMYY5QQM8yM2QZVGh8Gi7dqsS2yG9fywx_HoRrwQ/viewform?usp=sf_link*
        
- *Bahasa Indonesia ( Setiap Hari Kamis )*
https://forms.gle/vjxeD4Ayoehe3Q1L8
        
- *Pendidikan Kewarganegaraan ( Setiap Hari Jumat)*
*https://docs.google.com/forms/d/1EDfRgU0J-lXhyZjhgpvlHuO92M3xZc6NQlxUWcEXwAg/closedform*`);
        
    } else if (msg.body == '!nomorguru') {
        msg.reply(`
- *Pemrogramman Dasar* =  *Pak Benk*
( +62 821-3863-7333 ) 

- *Sistem Komputer/Simulasi dan Komunikasi Digital* = *Bu Rusma *
( +62 852-5221-5384 ) 

- *Komputer dan Jaringan Dasar* = Bu Sri Wahyuni 
( +62 857-5152-0308 ) 

- *Desain Grafis* = Pak Fadli 
( +62 821-4261-4284 ) 

- *​Matematika* = Pak Wahyu 
( +62 852-4775-3602 ) 

- *Bahasa Inggris* = Ma'am Ratna 
( +62 812-5301-8966 ) 

- *IPA / Fisika / Kimia* = Pak Ramlan 
( +62 822-5450-5450 ) 

- *Bahasa Indonesia* = Bu Nurdiana 
( +62 821-5420-6015 ) 

- *Pendidikan Kewarganegaraan* = Bu Elia 
( +62 813-4727-3547 ) 

- ​*Sejarah Indonesia* = Bu Sunarti 
( +62 852-5150-6165 ) 

- ​*Penjaskes* = Pak Burhan 
( +62 852-4131-0075 ) 

- ​*Seni Budaya* = Bu Retno 
( +62 812-9138-1171 ) 

- *​Agama Islam* = Bu Isma 
*( +62 812-5377-6667 )*`);

    } else if (msg.body == '!groupinfo') {
        let chat = await msg.getChat();
        if (chat.isGroup) {;
            msg.reply(`
*INFORMASI GROUP:*
Nama Group: 
*${chat.name}*
Deskripsi Group:
*${chat.description}*
Jumlah Orang di group: 
*${chat.participants.length}*`);
        } else {
            msg.reply(`[ERROR] Command ini harus di eksekusi di dalam group!`);
        }
    } else if (msg.body == '!botinfo') {
        let info = client.info;
        msg.reply(`
*INFORMASI BOT:*
Nama Host: 
*${info.pushname}*
Versi Bot: 
*${version}*

Bot Creator:
*lichKing112*
Source Code:
*Belum Tersedia*`);
    } else if (msg.body === '!everyone') {
        const chat = await msg.getChat();
        
        let text = "";
        let mentions = [];

        for(let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            
            mentions.push(contact);
            text += `@${participant.id.user} `;
        }

        chat.sendMessage(text, { mentions });
    }
    });
