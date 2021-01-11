const fetch = require('node-fetch');
require('dotenv').config();


module.exports = function (req, res, next) {

    let sitemapXml = "";
    let mapEnseigne = {};
    let root = process.env.PUBLIC_DOMAIN;
    const statics = [
        {"loc":"/", "changefreq":"weekly", "priority":"0.9"},
        {"loc":"/news", "changefreq":"weekly", "priority":"0.7"},
        {"loc":"/escapegame", "changefreq":"weekly", "priority":"0.7"},
        {"loc":"/selections", "changefreq":"monthly", "priority":"0.7"},
        {"loc":"/entreprise", "changefreq":"monthly", "priority":"0.3"},
        {"loc":"/jeux", "changefreq":"weekly", "priority":"0.7"},
        {"loc":"/about", "changefreq":"monthly", "priority":"0.3"}
    ];

    statics.forEach( n => {
        sitemapXml += "<url><loc>"+ root + n.loc +"</loc><changefreq>"+ n.changefreq +"</changefreq><priority>"+ n.priority +"</priority></url>";
    } );


    //escape, enseigne
    getInfo("escapes?_limit=1000").then( list => {

        list.forEach(element => {
            let ens = element.enseigne ? element.enseigne.uniquepath : "avis"; 
            sitemapXml += "<url><loc>"+ root + "/escapegame/" + ens + "/" + element.uniquepath +"</loc><lastmod>"+element.updated_at.substring(0,10)+"</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>";
            if( element.enseigne ) mapEnseigne[ element.enseigne.uniquepath ] = element.enseigne.updated_at;
        });
        
        Object.entries(mapEnseigne).forEach( n => {
            sitemapXml += "<url><loc>"+ root + "/escapegame/" + n[0] +"</loc><lastmod>"+ n[1].substring(0,10) +"</lastmod><changefreq>monthly</changefreq></url>";
        } );
        

       
        //jeux, news
        getInfo("jeuxes?_limit=1000").then( list => {

            list.forEach(element => {
                sitemapXml += "<url><loc>"+ root + "/jeux/" + element.uniquepath +"</loc><lastmod>"+element.updated_at.substring(0,10)+"</lastmod><changefreq>monthly</changefreq></url>";
            });

            
            getInfo("actus?_limit=1000").then( list => {

                list.forEach(element => {
                    sitemapXml += "<url><loc>"+ root + "/news/" + element.uniquepath +"</loc><lastmod>"+element.updated_at.substring(0,10)+"</lastmod><changefreq>monthly</changefreq></url>";
                });
            
                let fullXml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapXml}</urlset>`;
                //console.log( sitemapXml );
                res.set('Content-Type', 'application/xml');
                res.send( fullXml ).end();
            });
        
        });
    });


    
}


function getInfo(table) {
    return new Promise( (resolve,reject) => {
        const host = "http://localhost:1337/" + table;

        var myHeaders = {"Content-type":"application/json"};
        var myInit = { method: "GET",
                        headers: myHeaders
                    };
    
        fetch(host,myInit)
            .then(res => {
                if( res.status === 200 ) {
                    return res.json();
                } else {
                    reject();
                }
            })
            .then(json => 
            {
                resolve( json )
            });
    });   
}

