const express = require('express')
const app = express()
const port = 3000

const path = require("path");

var fs = require('fs')
var bodyParser = require('body-parser')
const { time } = require('console')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
var cors = require('cors');
app.use(cors());

const multer = require("multer");

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const upload = multer({
  dest: __dirname+"/pulibc/images"
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

function getAccounts() {
  let a = JSON.parse(fs.readFileSync("data.json"))
  let lock = false;

  a.forEach((it)=>{
    if(!it.id){
      lock = true;
      it.id = new Date().getTime();
    } 
  });
  if(lock){
    fs.writeFileSync("data.json",JSON.stringify(a));
  }
  return a;
}
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/accounts', (req, res) => {
  let accounts = getAccounts();
  accounts.forEach((a) => {
    delete a.password
  });
  res.send(accounts)
})

app.delete('/accounts', (req, res) => {
  let a = getAccounts();
  let r = a.filter((it) => {
    return it.email == req.body.email
  });
  if (r.length) {
    let index = a.indexOf(r[0]);
    a.splice(index, 1);
    fs.writeFileSync("data.json", JSON.stringify(a));
    res.send({
      status: true
    });
    return;
  }
  res.send({
    message:'Không tìm thấy email này',
    status: false
  });
});

app.post(
  "/upload",
  upload.single("file" /* name attribute of <file> element in your form */),
  (req, res) => {
    let fileName = new Date().getTime()+".png";
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, "./public/images/"+fileName);
console.log(targetPath);
    if (path.extname(req.file.originalname).toLowerCase() === ".png") {
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);

        res.send({
          url:"/images/"+fileName
        })
      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);

        res
          .status(403)
          .contentType("text/plain")
          .end("Only .png files are allowed!");
      });
    }
  }
);

app.put('/accounts', (req, res) => {
  let a = getAccounts();
  let { email, password,address, fullname, phone, avatar, description } = req.body
  let r = a.filter((it) => {
    return it.email == req.body.email
  });
  if (!r.length) {
    a.push({
      id: new Date().getTime(),
      fullname: fullname,
      email: email,
      password: password,
      address: address,
      phone: phone,
      avatar: avatar,
      description: description,
    });
    fs.writeFileSync("data.json", JSON.stringify(a));
    res.send({
      status: true
    });
    return;
  }
  res.send({
    status: false,
    message:'đã tồn tại email này'
  });
})

app.post('/account/:id', (req, res) => {
  let a = getAccounts();
  let { email, password,address, fullname, phone, avatar, description } = req.body
  let r = a.filter((it) => {
    return it.id == req.params.id
  });
  if (r.length) {
    let index = a.indexOf(r[0]);
    a[index] = {
      fullname: fullname,
      email: email,
      password: password,
      address: address,
      phone: phone,
      avatar: avatar,
      description: description,
    }
    fs.writeFileSync("data.json", JSON.stringify(a));
    res.send({
      status: true
    });
    return;
  }
  res.send({
    status: false
  });
})
app.post('/login', (req, res) => {
  let a = getAccounts();
  let r = a.filter((it) => {
    return it.email == req.body.email && it.password == req.body.password
  });
  let token = false;
  if (r.length) {
    token = new Date().getTime();
  }
  res.send({
    token: token
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
 
 