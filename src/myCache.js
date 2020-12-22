const fs = require('fs');
const md5 = require('md5');
const path = require('path');
require('dotenv').config();



module.exports.routes = ["/api/:target/:id","/api/:target"];


module.exports.clearCache = function (req, res, next) {
    clearCache(true);
    res.status("404").send("Done").end();
}

module.exports.use = function (req, res, next) {

    if( process.env.ENABLE_CACHE ) {

        let test = check_needCacheRefresh(req);
        if( test === false ) {
            let file = getFileName( req );
            if( file && fs.existsSync(file) ) {
                let mtime = fs.statSync(file).mtime;
                let data = JSON.parse( fs.readFileSync(file, {encoding:"utf-8"} ) );
                res.set('X-My-Cache', new Date( mtime ).getTime() );
                res.status(202).send( data );
                res.end();
            } else {
                next();
            }
        } else {
            next();
        }
    } else {
        next();
    }
};


module.exports.onProxyRes = (proxyRes, req, res) => { 
    if( process.env.ENABLE_CACHE ) {
        let test = check_needCacheRefresh( req );
        if( test === true ) {
            let body = [];
            proxyRes.on('data', function(chunk) {
                body.push(chunk);
           });
            proxyRes.on('end', function () {
                body = Buffer.concat(body).toString();
                //console.log("res from proxied server:", body);
                //res.end("my response to cli");
                saveIt( body, req );
            });
        }
    }
    proxyRes.pipe(res); 

    //Une chance sur 100 de déclencher un clean du cache
    if( Math.floor( Math.random() * 100 ) === 23 ) {
        clearCache(false);
    }
 
}

/**
 * Check if cache file need to be refreshed
 * @param {*} req 
 */
function check_needCacheRefresh( req ) {

    if( process.env.NO_CACHE_FROM === req.hostname ) {
        return null;
    }

    const cache_multiplier = parseInt( process.env.CACHE_X );
    let cacheAsk = parseInt( req.header("My-Cache") ) * cache_multiplier * (60 * 1000);
    if( cacheAsk <= 0 ) return null;

    let file = getFileName(req);
    if( file===null ) return null;

    if( !fs.existsSync(file) ) return true;
    else {
        let mtime = new Date( fs.statSync(file).mtime ).getTime();
        let age = new Date().getTime() - mtime;
        if( age > cacheAsk ) {
            return true;
        }
    }

    return false;
}

/**
 * Get cache file name
 * @param {*} req 
 */
function getFileName(req) {

    let xQuery = req.header("My-Cache-Query");
    let reg = /api\/graphql/i;
    let reg2 = /api\/.+/i;
    if( reg.test( req.originalUrl ) ) {
        if( xQuery ) {
            fname = "graphql";
        } else {
            return null;
        }
    } else if( reg2.test( req.originalUrl ) ) {
        fname = md5(req.originalUrl);
    } else {
        return null;
    }

    return process.env.CACHE_DIR + fname + (xQuery?xQuery:"") + ".cache";
}

/**
 * Update cache
 * @param {*} body 
 * @param {*} req 
 */
function saveIt( body, req ) {
    if (!fs.existsSync(process.env.CACHE_DIR)){
        fs.mkdirSync(process.env.CACHE_DIR);
    }
    let file = getFileName(req);
    fs.writeFileSync(file, JSON.stringify( body ), {encoding:"utf-8"} );
}


/**
 * Remove old and unused file
 */
function clearCache(erase) {
    if( process.env.CACHE_DIR ) {
        fs.readdir(process.env.CACHE_DIR, (err, files) => {
            //if (err) throw err;
          
            for (const file of files) {
                let p = path.join(process.env.CACHE_DIR, file);
                if( erase ) {
                    fs.unlink( p , err => {
                        //if (err) throw err;
                      });
                } else {
                    let mtime = new Date( fs.statSync(p).mtime ).getTime();
                    let age = new Date().getTime() - mtime;
    
                    if( age > (1000*60*60*24) ) { //24h
                        fs.unlink( p , err => {
                          //if (err) throw err;
                        });
                    }
                }
            }
          });
    }
}