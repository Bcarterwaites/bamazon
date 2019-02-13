var mysql = require("mysql")
var inquirer = require("inquirer")
var Table = require("cli-table")

var connection = mysql.createConnection({
    host: "localhost",
    
    port: 3306,

    user: "root",

    password: "pancakes",
    database: "bamazon"

});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connection sucessful!!");
    welcome();
});

//==========================================================\\

function welcome() {

    inquirer.prompt([{

        type: "confirm",
        name: "confirm",
        message: "Welcome to Bamazon!! Would you like to browse our wares?",
        default: true

}]).then(function(user) {
    if (user.confirm === true) {
        inventory();
    } else {
        console.log("Please come again!")
    }
});
}

//===============================================================================\\

function inventory() {

    var table = new Table ({
        head: ['ID', 'Item', 'Department', 'Price', 'Stock'],
        colWidths: [10, 30, 30, 30, 30]
    });

    displayInventory();

    function displayInventory() {

                    connection.query("SELECT * FROM products", function(err,res){
                      console.log("DISPLAYING ALL INVENTORY:" + "\n" + "----------------------------");
                      for (var i = 0; i < res.length; i++) {
                        console.log("Item ID: " + res[i].item_id + "\n" + "Product Name: " + res[i].product_name + "\n" + "Department: " + res[i].department_name + "\n" + "Price: " + res[i].price + "\n" + "Available Quantity: " + res[i].stock_quantity + "\n----------------------------");
                      }
            welcomeAgain();

         });
    }

}

//======================================Inquirer user====================================\\
function welcomeAgain() {

    inquirer.prompt([{

        type: "confirm",
        name: "continue",
        message: "Now that you have browsed are items would you like to make a purchase?",
        default: true

}]).then(function(user) {
    if (user.continue === true) {
        itemSelect();
    } else {
        console.log("Please come again!")
    }
});
}

//======================================Selection and Quantity=============================\\

function itemSelect() {

    inquirer.prompt([{

        type: "input",
        name: "itemID",
        message: "Please enter the ID of the item you wish to purchase.",
    },
    {
        type: "input",
        name: "quantity",
        message: "How many units would you like to purchase?",
    }
    
    ]).then(function(userPurchase) {
        connection.query("SELECT * FROM products WHERE item_id=?", userPurchase.itemID, function(err, res) {

            for (var i = 0; i < res.length; i++) {

                if (userPurchase.quantity > res[i].stock_quantity) {
                    console.log("Unfortuantely we don't have enough in stock, please try again!!!");
                    console.log("=========================================");
                    welcome();


                } else {
                    console.log("You've selected:");
                    console.log("=========================================");
                    console.log("Item: " + res[i].product_name)
                    console.log("==========================================");
                    console.log("Total: " + res[i].price * userPurchase.quantity);
                    console.log("=============================================");

                    var newStock = (res[i].stock_quantity - userPurchase.quantity);
                    var purchaseID  = (userPurchase.itemID);
                    confirmItem(newStock, purchaseID)
                }
            }
        });
    });
}

//=======================================Purchase Made==-================================\\

function confirmItem(newStock, purchaseID) {

    inquirer.prompt([{

        type: "confirm",
        name: "confirmItem",
        message: "Is this the correct quantity and item?",
        default: true


    }]).then(function(userConfirm) {
        if (userConfirm.confirmItem === true) {

            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: newStock
            }, {
                item_id: purchaseID
            }], function(err, res) {});

            console.log("=====================================") 
            console.log("Transaction sucessful!!")
            console.log("======================================")
            welcome();
            } else {
                console.log("=================================")
                console.log("Lets get you back to the main menu")
                console.log('====================================')
            }
        })
    }
