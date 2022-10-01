const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


async function main() {
  await mongoose.connect("mongodb://localhost:27017/todoList");
  const itemSchema = new mongoose.Schema({
    name: String
  });
  const Item = mongoose.model('Item', itemSchema);
  const item1 = new Item({
    name: "PythonProgramming"
  })
  const item2 = new Item({
    name: "Cook Food"
  })
  const item3 = new Item({
    name: "Check Mailbox"
  })

  const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
  });
  const List = mongoose.model('List', listSchema);
  // var today = new Date();
  // //var currentDay = today.getDay();
  // var options = {
  //   weekday: "long",
  //   day: "numeric",
  //   month: "long"
  // }
  // var day = today.toLocaleDateString("en-US", options);
  app.get("/", function(req, res) {
    Item.find({}, function(err, foundItems) {
      if (foundItems.length == 0) {
        Item.insertMany([item1, item2, item3]);
        res.redirect("/");
      } else {
        res.render('list', {
          day: "Home",
          newItem: foundItems
        });
      }

    });

    // var today = new Date();
    // //var currentDay = today.getDay();
    // var options = {
    //   weekday: "long",
    //   day: "numeric",
    //   month: "long"
    // }
    // var day = today.toLocaleDateString("en-US", options)
    // switch(currentDay){
    //   case 0:
    //     day="Sunday";
    //     break;
    //   case 1:
    //     day="Monday";
    //     break;
    //   case 2:
    //     day="Tuesday";
    //     break;
    //   case 3:
    //     day="Wednesday";
    //     break;
    //   case 4:
    //     day="Thursday";
    //     break;
    //   case 5:
    //     day="Friday";
    //     break;
    //   case 6:
    //     day="Saturday";
    //     break;
    //
    // }

  })
  app.get("/:customListName", function(req, res) {
    const customName = lodash.capitalize(req.params.customListName);
    List.findOne({name: customName}, function(err, listname) {
      if (!err) {
        if (listname) {
          res.render('list',{day:listname.name,newItem:listname.items});
        } else {
          const list = new List({
            name: customName,
            items: [item1, item2, item3]
          });

          list.save();
          res.redirect("/"+customName);
        }
      }
    });


  })
  // app.get("/work",function(req,res){
  //   res.render('list',{day:"WorkList",newItem:workItems});
  // })
  app.get("/about", function(req, res) {
    res.render('about');
  })
  app.post("/", function(req, res) {
    const value = req.body.nexttodo;
    const listname = req.body.button;
    const item = new Item({
      name: value
    });
    if ( listname === "Home" ) {
      item.save();
      res.redirect("/");
    }else {
      List.findOne({name:listname},function(err,foundList){
        if(!err){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listname);
        }
      })
    }
  });
  app.post("/delete", function(req, res) {
    const check = req.body.checkbox;
    const list = req.body.list;
    if(list === "Home"){
      Item.findByIdAndRemove(check, function(err) {
        if (!err) {
          console.log("Successfully deleted");
          res.redirect("/");
        }
      });
    }else{
      List.findOneAndUpdate({name:list},{$pull:{items:{_id:check}}},function(err){
        if (!err) {
          console.log("Successfully deleted");
          res.redirect("/"+list);
        }
      })
    }

  });

  app.listen(3000);
}
main().catch(err => console.log(err));
