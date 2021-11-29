import React, { useState, useEffect } from 'react';

import { fabric } from 'fabric';

const App = () => {
  
  const [canvas, setCanvas] = useState('');  
  const [apikey, setApiKey] = useState('');
  const [lang, setLang] = useState('en');
  const [searchData, setSearchData] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setCanvas(initCanvas());
  }, []);  
  
  const initCanvas = () => (
    new fabric.Canvas('canvas', {
      height: 800,
      width: 800,
      backgroundColor: 'grey'
    })
  );  

  //변경된 후 코드
  const addRect = (canvi, stickerImg) => {
    
    fabric.util.loadImage(`${stickerImg}`, img => { 

      const imgInstance = new fabric.Image(img);
      imgInstance.scale(0.5);

      canvi.add(imgInstance).renderAll();

    }, null, { crossorigin: 'Anonymous'});
  }

  //변경전 코드
  // const addRect = (canvi, stickerImg) => {
  //   fabric.Image.fromURL(`${stickerImg}`, img => { 
  //     img.scale(0.5);
  //     canvi.add(img).renderAll();
  //   });
  // }



  const search = async (searchText) => {
    
    setSearchText(searchText);

    const response = await fetch(`https://messenger.stipop.io/v1/search/test?q=${searchText}&userId=9937&lang=${lang === 'other' ? '':lang}&animated=N&limit=30`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey' : `${apikey}`
      }
      ,method: 'GET'
    });

    const data = await response.json();

    if (data.body.stickerList) {
      setSearchData(data.body.stickerList);
    } else {
      setSearchData([]);
    }
    
  }

  const save = () => {

    const data = canvas.toDataURL({
      format: 'png',
      quality: 0.8
    });

    const link = document.createElement('a');

    link.href = data;
    link.download = 'image.png';
    link.click();

  }

  return(
    <>
    <div style={{float:'left'}}>
      <h1>Fabric.js Test</h1>
      <canvas id="canvas" />
    </div>
    <div>
      <h1>Search Sticker</h1>
      <input type="Text" value={apikey} onChange={e => setApiKey(e.target.value)} placeholder="api key" />
      <select value={lang} onChange={e => setLang(e.target.value)}>
        <option value="en">English</option>
        <option value="ko">Korean</option>
        <option value="other">Other</option>
      </select>
      <input type="Text" value={searchText} onChange={e => search(e.target.value)} placeholder="search text" /><br/>
      <button onClick={save} >다운로드</button><br/>
      <ul style={{listStyle:'none'}}>
        {
          searchData.map((item, index) => {

              return (
                <li style={{float:'left'}} key={item.seq} onClick={() => addRect(canvas, item.stickerImg)}>
                  <img style={{width:100, height:100}} src={item.stickerImg} />
                </li>
              )

          })
        }
      </ul>
    </div>
    </>
  );
}

export default App;
