const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const _ = require('lodash');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.set('view engine', 'ejs');


//MongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://database:database@cluster0.erl1byd.mongodb.net/todolistDB');

const itemSchema = new mongoose.Schema({
    name:String
})

const Item = new mongoose.model('item',itemSchema);

const item1 = new  Item({
    name:"Item1"
})
const item2 = new  Item({
    name:"Item2"
})
const item3 = new  Item({
    name:"Item3"
})

const itemArray = [item1,item2,item3];

const listSchema = new mongoose.Schema({
    name:String,
    items:[itemSchema]
})

const List = new mongoose.model('List',listSchema);

app.get("/", (req, res) => {
    
    Item.find({},(err,foundItems)=>{
        if(foundItems.length==0){
            Item.insertMany(itemArray,(err)=>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully added data");
                }
            });
            res.redirect("/");
        }
        res.render('list', { listTitle: "Today" , newListItems:foundItems});
    })
    
})
app.get("/:customlistItems",(req,res)=>{
    const customListName = _.capitalize(req.params.customlistItems);
    List.findOne({name:customListName}, function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name:customListName,
                    items:itemArray
                })
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                res.render("list",  { listTitle:customListName , newListItems:foundList.items});
            }
        }
       
    })
   
})
app.post("/",(req,res)=>{
    
    const itemName = req.body.item;
    const listName = req.body.list;
    let item= new Item({
        name:itemName
    })
    if(listName == "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
    
    
})
app.post("/delete",(req,res)=>{
    const deleteItem = req.body.checkbox;
    const listName = req.body.listName;
    
    if(listName === "Today"){
        Item.deleteOne({name:deleteItem},(err)=>{
            if(err){
                console.log(err);
            }
            else{
                console.log("Successfully Deleted");
            }
            res.redirect("/");
        })
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{name:deleteItem}}},(err,foundList)=>{
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
    
})

app.listen(3000, () => {
    console.log("Server running on port 3000");
})
