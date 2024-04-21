const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Post = require("./models/posts");
const successHandle = require("./successHandle");
const errorHandle = require("./errorHandle");

dotenv.config({"path":"./config.env"});
const DB = process.env.DATABASE.replace("<password>",process.env.DATABASE_PASSWORD);
mongoose.connect(DB)
        .then(() => console.log("資料庫連接成功"))
        .catch(error => console.log(error));

const requestListener = async(req, res) => {
    let body = "";
    req.on("data", chunk=>{
        body+=chunk;
    });

    if(req.url == "/posts" && req.method == "GET"){
        const posts = await Post.find();
        successHandle(res,posts);
    }
    else if(req.url == "/posts" && req.method == "POST"){
        req.on("end",async()=>{
            try{
                const data = JSON.parse(body);
                const newPost = await Post.create(
                    {
                        name: data.name,
                        content: data.content
                    }
                );
                const posts = await Post.find();
                successHandle(res,posts);
            }
            catch(error){
                errorHandle(res,400,"資料填寫不正確");
            }
        });
    }
    else if(req.url == "/posts" && req.method == "DELETE"){
        await Post.deleteMany({});
        successHandle(res,[]);
    }
    else if(req.url.startsWith("/posts/") && req.method == "DELETE"){
        try{
            const id = req.url.split("/").pop();
            const deletePost = await Post.findByIdAndDelete(id);
            if(deletePost !== null){
                const posts = await Post.find();
                successHandle(res,posts);
            }
            else{
                errorHandle(res,400,"查無此id");
            }
        }
        catch(error){
            errorHandle(res,400,"資料填寫不正確");
        }
        
    }
    else if(req.url.startsWith("/posts/") && req.method == "PATCH"){
        req.on("end",async()=>{
            try{
                const data = JSON.parse(body);
                const id = req.url.split("/").pop();
                if(data.name !== undefined && data.content !== undefined){
                    const updateData = {
                        name: data.name,
                        content: data.content
                    }
                    const updatePost = await Post.findByIdAndUpdate(id,updateData,{new:true});
                    if(updatePost !== null){
                        const posts = await Post.find();
                        successHandle(res,posts);
                    }
                    else{
                        errorHandle(res,400,"查無此id");
                    }
                    
                }
                else{
                    errorHandle(res,400,"資料填寫不正確");
                }
            }
            catch(error){
                errorHandle(res,400,"資料填寫不正確");
            }
        });
    }
    else if(req.method == "OPTIONS"){
        res.writeHead(200, headers);
        res.end();
    }
    else{
        errorHandle(res,404,"無此路由");
    }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3015);