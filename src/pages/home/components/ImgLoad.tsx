import React, {useEffect, useState, FC} from 'react';
import { ImgLoad } from '../../../shared';
import { Spin, Image as AntdImage } from "antd";
import "../../../styles/img-loading.less";
import { LoadingOutlined } from '@ant-design/icons';
const SwitchImgLoad: FC<ImgLoad> = ({ placeholder, style, src, preview, fallback, onClick, sourcePath }) => {
    // 要加载的图片资源
    const picList = [src];

    // 加载进度数值
    const [loadNum, setLoadNum] = useState(0);
    const [showPicList, setShowPicList] = useState([]);


    // 加载处理函数
    const loadFun = (arr:string[]=[], callback:any): void=>{
        let len:number = 0;    
        let num:number = 0;
        callback(0)
        for(let i = 0; i < arr.length; i++){
            (function(i){
                const img = new Image();
                img.src = arr[i];
                img.onload = function(){
                    len ++;
                    num = (len / arr.length) * 100
                    callback(num , len-1, img.src);
                }
            })(i);
        }
    }

    useEffect(()=>{
        // 执行代码 
        loadFun(picList, (num:number, idx:number, src:never)=>{
            if(src){
                showPicList.push(src);
                setShowPicList(showPicList);
                setLoadNum(num);
            }
        });
    
    },[picList, showPicList]);

    return <div className="img-loading-box">
        <AntdImage
            placeholder={placeholder}
            style={style}
            src={loadNum === 100 ? src : sourcePath || fallback}
            preview={preview}
            fallback={fallback}
            onClick={() => onClick && onClick()}
        >
        </AntdImage>
    </div>
}

export default SwitchImgLoad;

