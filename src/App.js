import React, { useState, useEffect } from 'react';
import Typesense from 'typesense';
import styled from "styled-components";

import { fabric } from 'fabric';

const Box = styled.div`
	width: 1920px;
	height: 990px;
	background-color: #ffffff;
`;

const Headers = styled.div`
    width: 1920px;
    height: 80px;
`;

const Logo = styled.div`
    width: 102px;
    height: 36px;
    object-fit: contain;
    background-image: url(/images/stipop-logo.png);
    margin: 20px 0 24px 68px 
`;

const Title = styled.div`
    width: 207px;
    height: 27px;
    font-family: Manrope-ExtraLight_;
    font-size: 20px;
    font-weight: 800;
    color: #2b292d;
    margin: 6px 0 0 68px
`;

const Contents = styled.div`
    width: 630px;
    height: 96px;
    font-family: Manrope;
    font-size: 18px;
    font-weight: 600;
    color: #2b292d;
    margin: 12px 0 0 68px
`;

const Body = styled.div`
    width: 100%;
    align-items: center;
    margin-top: 40px;
`;

const SearchBox = styled.div`
    width: 614px;
    height: 676px;
    border-radius: 6px;
    border: solid 1px #d9d9d9;
    background-color: #ffffff;
    display: inline-block;
    float: left;
    margin: 0 0 0 68px;
    overflow:scroll;
`;

const CanvasArea = styled.div`
    width: 1193px;
    height: 676px;
    border-radius: 6px;
    border: solid 1px #2b292d;
    background-color: #f9f9f9;
    display: inline-block;
    float: left;
    margin: 0 0 0 20px;
`;

const SearchInput = styled.input`
    width: 495px;
    height: 58px;
    object-fit: contain;
    border-radius: 18px;
    border: solid 1px #d9d9d9;
    background-color: #ffffff;
    margin: 16px 0 0 16px;
    padding-left: 71px;
    font-size: 24px;
    line-height: 18px;
    color: #343c4b;
    background-image: url(/images/icon-copy.png);
    background-repeat: no-repeat;
    background-position: left;
    background-position-x: 20px;
`;

const Name = styled.div`
    
    position: absolute;
    height: 20px;

    display: none;
    font-size: 15px;
    background-color: #fefefe;
`

const ImgList = styled.li`
    float: left;
    padding-right: 32px;
    &:hover ${Name} {
        display: block;
    }
`;

const App = () => {
	
	const [canvas, setCanvas] = useState('');  
	const [apikey, setApiKey] = useState('');
	const [lang, setLang] = useState('en');
	const [searchData, setSearchData] = useState([]);
	const [searchData2, setSearchData2] = useState([]);
	const [searchText, setSearchText] = useState('');
	const [searchText2, setSearchText2] = useState('');

    let client = new Typesense.Client({
        'nodes': [{
          'host': '13.125.236.229', // For Typesense Cloud use xxx.a1.typesense.net
          'port': '8108',      // For Typesense Cloud use 443
          'protocol': 'http'   // For Typesense Cloud use https
        }],
        'apiKey': 'uFFVccKWYkFXJ59HRGAqUflZpkCODaTOaNJZvPRwCjKRlsKf',
        'connectionTimeoutSeconds': 2
    });

	useEffect(() => {
		setCanvas(initCanvas());
	}, []);  
	
	const initCanvas = () => (
		new fabric.Canvas('canvas', {
			width: 1193,
			height: 676
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

	const search = async (searchText) => {
		
		setSearchText(searchText);

        if (searchText.length > 1) {
            const response = await fetch(`https://messenger.stipop.io/v1/search/test?q=${searchText}&userId=9937&lang=en`, {
                headers: {
                    'Content-Type': 'application/json',
                    // 'apikey' : `985dc59477b993158fe3d44324a38616`
                    'apikey' : `${process.env.REACT_APP_API_KEY}`
                }
                ,method: 'GET'
            });
    
            const data = await response.json();
    
            if (data.body.stickerList) {
                setSearchData(data.body.stickerList);
            } else {
                setSearchData([]);
            }
        } else {
            setSearchData([]);
        }

	}

    const typesense = async (searchText) => {

		setSearchText2(searchText);

        const searchParameters = {
            'q'         : `${searchText}`,
            'query_by'  : 'keyword',
            'page'      : 1,
            'per_page'  : 100,
            'group_by'  : 'stickerId',
            'group_limit' : 1,
        };

        const searchResults = await client.collections('stickers_test').documents().search(searchParameters);

        console.log(searchResults);

        // if (searchResults.hits.length > 0) {
        //     setSearchData2(searchResults.hits);
        // }
        if (searchResults.grouped_hits.length > 0) {
            setSearchData2(searchResults.grouped_hits);
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
		<Box>
            <Headers>
                <Logo />
            </Headers>
            <Title>
                Sticker Search Demo
            </Title>
            <Contents>
                1) Search sticker using the search UI on the left (ex. hi, happy, good) <br />
                2) Click on a sticker to add it to the board on the right<br />
                3) Try moving & resizing stickers on the board<br />
                4) Hover on the sticker from the search UI to find it’s sticker pack name
            </Contents>
            <Body>
                <SearchBox>
                    <SearchInput value={searchText} onChange={e => search(e.target.value)} placeholder="Search sticker.." />
                    <ul style={{listStyle:'none'}}>
                    {
                        searchData.map((item, index) => {
                                return (
                                    <ImgList key={item.seq} onClick={() => addRect(canvas, item.stickerImg)} >
                                        <img style={{width:100, height:100}} src={item.stickerImg+"?d=100x100"} title={item.packageName} />
                                        {/* <Name>{item.packageName}</Name>
                                        </img> */}
                                    </ImgList>
                                )

                        })
                    }
                    </ul>
                </SearchBox>

                <SearchBox>
                    <SearchInput value={searchText2} onChange={e => typesense(e.target.value)} placeholder="Search sticker.." />
                    <ul style={{listStyle:'none'}}>
                    {
                        searchData2.map((item, index) => {
                                return (
                                    // <ImgList key={item.document.stickerId} >
                                    //     <img style={{width:100, height:100}} src={item.document.stickerImg+"?d=100x100"} />
                                    // </ImgList>
                                    <ImgList key={item.hits[0].document.stickerId} >
                                        <img style={{width:100, height:100}} src={item.hits[0].document.stickerImg+"?d=100x100"} />
                                    </ImgList>
                                )

                        })
                    }
                    </ul>
                </SearchBox>
                {/* <CanvasArea>
                    <canvas id="canvas" />
                </CanvasArea> */}
            </Body>
		</Box>
	);
}

export default App;
