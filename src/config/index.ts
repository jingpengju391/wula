// export const AXIOSURL = "http://121.37.25.71:42233"
// export const IMURL = "ws://121.37.25.71:30000"
// export const ADMINURL = "http://121.37.25.71:10000"

//香港2区
export const AXIOSURL = "http://43.132.194.32:42233"
export const IMURL = "ws://43.132.194.32:30000"
export const ADMINURL = "http://43.132.194.32:10000"

//我自己写的验证接口域名 
export const CheckLogin = "http://api.wulaim.com"
export const FileStorage = CheckLogin + "/api/minio/getfile?filename=";
//这尼玛的 访问不了 需要改成上边👆这个 replace
export const MinIOAddress = "http://43.132.194.8:9000/openim/";

// export const AXIOSURL = "http://43.128.5.63:42233"
// export const IMURL = "ws://172.16.9.247:30000"
// export const ADMINURL = "http://43.128.5.63:10000"

// export const AXIOSURL = "https://open-im-online.rentsoft.cn"
// export const IMURL = "wss://open-im-online.rentsoft.cn/wss"
// export const ADMINURL = "https://open-im-online.rentsoft.cn"

export const AXIOSTIMEOUT = 60000

export const OBJECTSTORAGE:"cos"|"minio" = "minio"
export const PICMESSAGETHUMOPTION = "?imageView2/1/w/200/h/200/rq/80"
//添加于2022年3月26日 15:06:20 
export const PICMESSAGETHUMOPTIONEx = "&imageView2/1/w/200/h/200/rq/80"
export const LANGUAGE = "zh-cn"

export const getIMUrl = () => localStorage.getItem("IMUrl")?localStorage.getItem("IMUrl")!:IMURL
export const getAxiosUrl = () => localStorage.getItem("IMAxiosUrl")?localStorage.getItem("IMAxiosUrl")!:AXIOSURL
export const getAdminUrl = () => localStorage.getItem("IMAdminUrl")?localStorage.getItem("IMAdminUrl")!:ADMINURL
export const getLanguage = () => localStorage.getItem("IMLanguage")?localStorage.getItem("IMLanguage")!:LANGUAGE