const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI);

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userName: String,
  userId: String
});

const ExerciseSchema = new Schema({
  userId: {type:String, required:true},
  description: {type:String, required:true},
  duration: {type:Number, required:true},
  date: {type:Date, required:true}
});

const userModel = new mongoose.model('userModel',UserSchema);
const exerciseModel = new mongoose.model('exerciseModel',ExerciseSchema);

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.get("/api",(req,res)=>{
  res.json("Hello");
});
app.route("/api/exercise/new-user").post(bodyParser.urlencoded({extended:false}),(req,res)=>{
  let userName = req.body.username;
  checkUser(userName)
    .then((data)=>{
    if(data.status) {res.json({Error:"UserName Already Taken"});}
    else{
      return saveUser(userName);
    }
  })
    .then((data)=>{
    console.log(data);
   return res.json(data);
  });
    
});

//Adding Exercice 
app.route("/api/exercise/add").post(bodyParser.urlencoded({extended:false}),(req,res)=>{
    let newExo={userId: req.body.userId, 
        description:req.body.description,
        duration : req.body.duration,
        date : (new Date(req.body.date)).toDateString()};
  console.log(newExo);
    checkUserId(newExo.userId).then((data)=>{
        if(data.status){
          console.log("[CheckUserId] PASS--");
          return checkIfExist(newExo.description);
        }
      else return res.json({Error:"Invalid ID"});
      
    }).then((data)=>{
        if(data.status)  return res.json(newExo);
          else{console.log("[CheckIfExist] PASS--"); return  checkData(newExo);}
    }).then((data)=>{
      if(data.status) {console.log("[CheckData] PASS--"); return saveExercise(newExo);}
      else return res.json(data.error);
    }).then((data)=>{
      if(data){
      console.log("[saveExo] PASS-- and data:"+data);
      return  res.json(data);
      }
    });

});

app.route("/api/exercise/log").get((req,res)=>{
  console.log(req.query);
  getExoByUser(req.query.userId).then((data)=>{
    console.log(data);
    res.json(data);
  })
  
})
// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
});


let checkUser = (user)=>{
  return new Promise((resolve,reject)=>{
    userModel.findOne({userName:user},(err,data)=>{
      if(err||data==null)  return resolve({status:false});
      else return resolve({status:true});
    });
  });
};

let saveUser = (user)=>{
  return new Promise((resolve,reject)=>{
    let userId = Math.floor(Math.random()*1000) +""+Math.floor(Math.random()*1000);
    let newUser = new userModel({userName:user,userId:userId})
    newUser.save((err,data)=>{
      if(err) reject(err);
      else return resolve({UserName:data.userName,User_id:data.userId});
    });
  });
};

let checkIfExist = (desc)=>{
  return new Promise((resolve,reject)=>{
    exerciseModel.findOne({description:desc},(err,data)=>{
      if(err||data==null) return resolve({status:false});
      else return resolve({status:false}); 
    });
  });
};

let checkUserId = (userId)=>{
  return new Promise((resolve,reject)=>{
    userModel.findOne({userId:userId},(err,data)=>{
      if(err||data==null) return resolve({status:false});
      else return resolve({status:true});
    });
  });
};

let saveExercise = (exo)=>{
  
  
  let exercise = new exerciseModel(exo);
  return new Promise((resolve,reject)=>{
    exercise.save((err,data)=>{
      if(err) return reject(err);
      else {console.log(data);return resolve(data);}
    });
  });
};

let checkData = (data)=>{
  return new Promise((resolve,reject)=>{
    if(isNaN(data.duration)) return resolve({status:false,error:"'duration' is not a valide Number "}); 
    else if((data.date)=="Invalid Date") return resolve({status:false,error:"Invalid Date"});
    else return resolve({status:true})
  })
}

let getExoByUser=(userId)=>{
  return new Promise((resolve,reject)=>{
    exerciseModel.findOne({userId:userId},(err,data)=>{
      if(err) return reject(err);
      else{console.log(userId); return resolve(data);}
      })
  })
} 
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

