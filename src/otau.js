const fetch = require('node-fetch');
const fs = require('fs');
const main = require('./index.js');
const rimraf = require('rimraf');
const {shell} = require('electron');

var currentVersion = 'v0.0.4';

var user = "RekkyRek";
var repo = "droppl";
var dlPath = `${main.app.getPath('downloads')}\\${repo}_update_tmp\\`;

if(fs.existsSync(dlPath)) rimraf.sync(dlPath);

console.log('Current version is '+currentVersion);
console.log('Checking for updates...');

fetch(`https://api.github.com/repos/${user}/${repo}/releases`)
    .then(function(res) {
			return res.json();
    }).then((json)=>{
			console.log('Current release on GitHub: ' + json[0].tag_name);
			if(json[0].tag_name == currentVersion) {
				console.log('Client is up to date.');
			} else {
				console.log('Client is outdated. Requesting access to download update...');
				main.requestUpdatePermission()
					.then(()=>{
						console.log('Permission granted. Downloading update');
						console.log('Downloading '+json[0].assets[0].browser_download_url+` to ${dlPath}`);
						if(fs.existsSync(dlPath)) rimraf.sync(dlPath);
						fs.mkdirSync(dlPath);
						fs.writeFile(`${dlPath}update.exe`, null, function (err) {
							if (err) throw err;
						});
						fetch(json[0].assets[0].browser_download_url)
							.then(function(res) {
								var dest = fs.createWriteStream(`${dlPath}update.exe`);
								res.body.pipe(dest);
								dest.on('finish', ()=>{
									console.log('Update downloaded. Opening Installer...');
									shell.openItem(`${dlPath}update.exe`);
									main.win_main.removeAllListeners('close');
									main.win_main.close();
									main.app.quit();
								});
							});
					})
					.catch((err)=>{
						console.log(err);
					});
			}
		}).catch(function(err) {
        console.log(err);
    });
