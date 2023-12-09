const props = {
    FINAL_FALLBACK_URL:"",
    PUBLIC_URL: "/service/pdf-embed-tool",//same as the home page in package.json
    CORS_PROXY: "",
}

if(!window.process){
    window.process = {
        env: props
    }
}else {
    window.process.env = {...props, ...window.process.env}
}


