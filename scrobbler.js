import Lastfm from 'simple-lastfm';
import fs from "fs";
import path from "path";

const folderPath = 'SL SCORES PATH'; //example: C:/Users/Simred/AppData/Roaming/ITGmania/Save/LocalProfiles/00000000/SL-Scores
const lastfm_key = "LASTFM KEY"
const lastfm_secret = "LASTFM SECRET"
const lastfm_username = "LASTFM USERNAME"
const lastfm_password = "LASTFM PASSWORD"

function getNewestFile(dir) {
    const files = fs.readdirSync(dir);
    const sortedFiles = files
        .map((file) => ({
            name: file,
            ctime: fs.statSync(path.join(dir, file)).ctime,
        }))
        .sort((a, b) => b.ctime - a.ctime);

    if (sortedFiles.length > 0) {
        return sortedFiles[0].name;
    } else {
        return null;
    }
}

var lastname = "0";
var lastfm = new Lastfm({
    api_key: lastfm_key,
    api_secret: lastfm_secret,
    username: lastfm_username,
    password: lastfm_password
});

lastfm.getSessionKey(function (session_result) {
    console.log("lastfm session established");
    if (session_result.success) {
        setInterval(() => {
            let newestFileName = getNewestFile(folderPath);
            if (newestFileName) {
                if (lastname != newestFileName && lastname != "0") {
                    let filePath = path.join(folderPath, newestFileName);
                    let fileContents = fs.readFileSync(filePath, 'utf8');
                    let object = JSON.parse(fileContents);
                    let artist = object.Song.Artist;
                    let title = object.Song.Title;
                    lastfm.scrobbleTrack({
                        artist: artist,
                        track: title,
                        callback: function (result) {
                            console.log("successfully scrobbled: ", artist, " - ", title);
                        }
                    });
                }else{
                    console.log("no new scores");
                }
                lastname = newestFileName;
            } else {
                console.log('No files found in the specified folder.');
                lastname = "1";
            }
        }, 30000);
    } else {
        console.log("Error: " + session_result.error);
    }
});