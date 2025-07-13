import app from './src/app';

//启动服务
const PORT=process.env.PORT? parseInt(process.env.PORT) : 3000;
app.listen(PORT,()=>{
    console.log(`API服务运行在 http://localhost:${PORT}`)
})
