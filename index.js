const puppeteer = require('puppeteer');
const express = require('express');

const app = express()

var formURI = function(xt,dn,tr){
  var magnetLink = 'magnet:?xt='+xt+"&dn="+dn;
  for(var i = 0;i<tr.length;i++){
      magnetLink = magnetLink+"&tr="+tr[i]
  }
  console.info("URI Formed : "+encodeURI(magnetLink));
  return encodeURI(magnetLink);
}


app.get("/:data",async (req,res)=>{
  console.log(req.params.data);
  var xt = req.query.xt;
  var dn = req.query.dn;
  var tr = req.query.tr;
  var torrentId =  formURI(xt,dn,tr);
  var link = await main(torrentId);
  res.json(link);
})

app.listen(3000)

main = async (torrentId) => {
    const browser = await puppeteer.launch({headless: true,devtools: false
    });
    const page = await browser.newPage();
    await page.goto('https://webtor.io/en/',{waitUntil: 'networkidle2'});
    const button = await page.$('.btn.btn-primary.btn-lg.dropdown-toggle.dropdown-toggle-split');
    await button.click();
    await page.focus('.form-control.form-control-sm')
    await page.keyboard.type(torrentId)
    await page.keyboard.type(String.fromCharCode(13))
    await page.waitFor('.btn.preroll-skip.btn-primary');
    await page.$eval( '.btn.preroll-skip.btn-primary', btn => btn.click() );
    const l = await page.$$('.list-group-item.list-group-item-action.item');
    page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: './'
  });
  await page.waitFor('.mejs__cannotplay',{timeout:480000});
    var a = await page.$('.mejs__cannotplay > a');
    var link = await a.evaluate(s=>{
        
        console.log(s.getAttribute('href'));
        return s.getAttribute('href');
    })
    await page.screenshot({path: 'example.png', fullPage: true});
    await browser.close();
    return link;
  };