//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ =require('lodash');
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-masood:test123@cluster0-i43hc.mongodb.net/todolistDB", {
    useNewUrlParser: true
});
const itemSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
    name: "Welcome todo List"
});
const item2 = new Item({
    name: "Hit the + button to add a new item."
});
const item3 = new Item({
    name: "<-- Hit this to delete an item."
});
const defaultItem = [item1, item2, item3];
//const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];
const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});
const List = mongoose.model("List", listSchema);
app.get("/", function (req, res) {

    //const day = date.getDate();
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItem, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("success");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });
        }
    });


});

app.post("/", function (req, res) {

    const itemName = req.body.add;
    const submitName=req.body.submit;

    /* if (req.body.submit === "Work List") {
         workItems.push(item);
         res.redirect("/work");
     } else {
         items.push(item);
         res.redirect("/");
     }*/
     const item = new Item({
        name: itemName
    });
    if(submitName==="Today")
        {
    item.save();
    res.redirect("/");
        }
    else{
        List.findOne({name:submitName},function(err,foundList){
           if(!err) 
               {
                   foundList.items.push(item);
                   foundList.save();
                   res.redirect("/"+submitName);
               }
        });
        
    }
});
app.post("/delete", function (req, res) {
    const deleteName = req.body.checkbox;
    const name=req.body.listname;
    //console.log(name);
    //console.log(deleteName);
    if(name==="Today"){
        Item.findByIdAndRemove({
        _id: deleteName
    }, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
    }
    else{
        List.findOneAndUpdate({
            name:name
        },
        {$pull:{items:{_id:deleteName}}},
        function(err){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/"+name);
            }
        }
        )
    }
});
/*app.get("/work", function (req, res) {
    res.render("list", {
        listTitle: "Work List",
        newListItems: workItems
    });
});*/

app.get("/:userurl", function (req, res) {
    const custom= req.params.userurl;
    const customurl=_.capitalize(custom);
    List.findOne({
        name:customurl
    }, function (err, found) {
        if (!found) {
            //create a new list
             const lists = new List({
                name: customurl,
                items: defaultItem
            });

            lists.save();
            res.redirect("/customurl");

        } else {
               //show an existing list
            res.render("list", {
                listTitle: found.name,
                newListItems: found.items
            });
        }
        
    });
});
 
app.get("/about", function (req, res) {
    res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
    console.log("Server started on port 3000");
});
