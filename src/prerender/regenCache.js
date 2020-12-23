/**
 * This page allow the refresh of Prerender pages
 */
const fs = require('fs');
const { default: fetch } = require('node-fetch');
const path = require('path');
require('dotenv').config();

module.exports = regenCache = {};

regenCache.runUpdate = (req, res, next) => {
    let startOn = new Date().getTime();
    regenCache.listUrls().then( list => {
        let started = list.length;
        if( started === 0 ) {
            res.send("Nothing to do...").end();
        } else {
            let errors = [];
            getNextFile( list, errors, res, startOn );
        }
        
    });
};

function getNextFile( list , errors, res, startOn ) {

    let onEnded = () => {
        if( list.length <= 0 ) {
            res.send("All task done. <h3>Errors :</h3><pre>"+JSON.stringify(errors,null,4)+"</pre>"  ).end();
        } else {
            let timespent = new Date().getTime() - startOn;

            if( timespent > parseInt(process.env.PRERENDER_REFRESH_TIMEOUT) * 60 * 1000 ) {
                res.send("Timeout").end();
                throw new Error("Timeout !");
            } else {
                getNextFile( list, errors, res, startOn);
            }
        }

    };

    let n = list.pop();

    //if update more than 2 hours
    let mtime = new Date( fs.statSync(n.file).mtime ).getTime();
    let ageUpdated = new Date().getTime() - mtime;
    if( ageUpdated > 0 * 2 * 60 * 60 * 1000 ) {
        regenCache.updateUrl( n.url, n.file ).then( onEnded ).catch( () => {
            errors.push( n.url );
            onEnded();
        });
    } else {
        onEnded();
    }
}

regenCache.updateUrl = (url, localfile) => {
    return new Promise( (resolve,reject) => {
        //console.log("> Refresh started", url);
        let target = "http://localhost:" + process.env.PRERENDER_PORT + "/render?url=" + encodeURI( url );
        if( localfile ) {
            fs.unlinkSync( localfile );
        }
        fetch( target ).then( ans => {
            if( ans.status === 200 ) {
                //console.log(">>>> Refresh ended", url);
                resolve();
            } else {
                //console.log("xxx Error on", url);
                reject();
            }
        }).catch( (ans) => { /*console.log("xxx Error on", url);*/ reject();} );
    } );
};

regenCache.displayList = (req, res, next) => {
    regenCache.listUrls().then( list => {

        let ans = `
        <h1>Liste des pages en cache pour le SEO</h1>
        <table cellpadding=10 cellspacing=5 border=1>
            <tr>
                <th style='min-width:300px'>Url</th>
                <th>Age</th>
                <th>Expire</th>
                <th>Size</th>
            </tr>`;
        
        ans += list.sort( (a,b) => b.age - a.age ).map( n => `<tr>
                    <td><a href='${n.url}' target="_blank">${n.url}</a></td>
                    <td>${Math.round( n.age / (1000*60*60) )} h</td>
                    <td>${new Date(n.expires).toUTCString()}</td>
                    <td>${Math.round(n.size/1000)} ko</td>
                </tr>`).join("");
        ans += `</table>`;

        res.send( ans ).end();

    } );
};


regenCache.listUrls = () => {
    return new Promise( (resolve,reject) => {
        
        if (!fs.existsSync(process.env.PRERENDER_CACHE_DIR)){
            reject("Dir not exist", process.env.PRERENDER_CACHE_DIR);
        } else {
            const reg = /\.dat$/
            fs.readdir(process.env.PRERENDER_CACHE_DIR, (err, files) => {
                
                let out = files.map( file => {
                    if( reg.test(file) ) {
                        let pth = path.join(process.env.PRERENDER_CACHE_DIR, file);
                        
                        let mtime = new Date( fs.statSync(pth).mtime ).getTime();
                        let age = new Date().getTime() - mtime;

                        let content = JSON.parse( fs.readFileSync( pth, {encoding:"utf-8"} ) );
            
                        if( content ) {
                            return {
                                "file":pth,
                                "url":content.key,
                                "expires":parseFloat(content.expires) + (process.env.PRERENDER_TTL * 1000),
                                "size":content.size,
                                "age":age
                            };
                        }
                        return null;
                    }
                }).filter( n => n !== null);
                resolve(out);
            });
        }
    } );
};