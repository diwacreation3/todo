$(document).ready(function() {
    const itemInput = $("#item-input");
    const category = $("#category");
    const aisleInput = $("#aisle-input");
    const note = $("#note");
    const quantity = $("#quantity");

    const submitButton = $("#submit-button");
    const sortItemsButton = $("#sort-items-button");
    const deleteAllItemsButton = $("#delete-all-items-button");

    const itemsMasterContainer = $("#items-master-container");
    const itemStatusMessage = document.getElementById("item-status-message");

    function Item(item, aisle, note, quantity, id) {
        this.item = item;
        this.aisle = aisle;
        this.note = note || "(Note...)";
        this.quantity = quantity || "(Quantity...)";
        this.id = id || Date.now();
    }

    Item.prototype.toHTML = function() {
        return $(`
        <section id=${this.id} class="each-idea-container">
          <h2 contenteditable="false" class="editable-item"> Item: ${this.item}</h2>
          <h3 contenteditable="false" class="editable-aisle"> Aisle: ${this.aisle}</h3>
          <h4 contenteditable="true" class="note">${this.note}</h4>
          <h5 contenteditable="true" class="quantity"> ${this.quantity}</h5>
          <button class="delete-button"> Delete Item</button>
        </section>
        `);
    };

    const itemManager = {
        //this === itemManager

        items: [],

        add: function(newItem, newAisle, newNote, newQuantity) {
            this.items.push(new Item(newItem, newAisle, newNote, newQuantity));
            this.store();
            this.count();
        }, // end of add

        count: function() {
            let count = 0;
            for (var i = 0; i < this.items.length; i++) {
                count = count + 1;
            }
            if (count > 0) {
                itemStatusMessage.innerText = "You have " + count + " " + "item(s) remaining on your list.";
            } else {
                itemStatusMessage.innerText = "There are no items on your list!";
            }
        },

        deleteAllItems: function() {
            this.items = [];
            this.store();
            this.count();
        },

        findID: function(id) {
            var targetId = parseInt(id);
            var found = this.items.find(function(item) {
                return item.id === targetId;
            });
            return found;
        },

        remove: function(id) {
            var targetId = parseInt(id);
            this.items = this.items.filter(function(item) {
                return item.id !== targetId;
            });
            this.store();
            this.count();
        }, // end of remove

        render: function() {
            itemsMasterContainer.html("");
            this.items.forEach(function(item) {
                itemsMasterContainer.append(item.toHTML());
            }); // end of forEach
        }, // end of render

        retrieve: function() {
            var retrieveditems = JSON.parse(localStorage.getItem("items"));
            if (retrieveditems) {
                retrieveditems.forEach(function(item) {
                    itemManager.items.push(new Item(item.item, item.aisle, item.note, item.quantity, item.id));
                });
            } // end of if statement
        }, // end of retrieve

        sortItems: function() {
            this.items.sort(function(a, b) {
                return a.aisle - b.aisle;
            });
            this.store();
        }, //end of sortItems

        store: function() {
            localStorage.setItem("items", JSON.stringify(this.items));
            this.render();
        }, // end of store

    }; // end of itemManager

    Item.prototype.editItemName = function(text) {
        this.item = text;
        itemManager.store();
    };

    Item.prototype.editItemAisle = function(text) {
        this.aisle = text;
        itemManager.store();
    };

    Item.prototype.editItemNote = function(text) {
        this.note = text;
        itemManager.store();
    };

    Item.prototype.editItemQuantity = function(text) {
        this.quantity = text;
        itemManager.store();
    };

    submitButton.on("click", function() {
        addUserInputToProgram();
        clearInputFields();
    });

    sortItemsButton.on("click", function() {
        itemManager.sortItems();
    });

    $("input").on("keyup", function(key) {
        if (key.which === 13) {
            addUserInputToProgram();
            clearInputFields();
        }
    });

    itemsMasterContainer.on("keyup", ".editable-item", function(key) {
        if (key.which === 13) {
            var text = $(this).closest("h2").text();
            var id = $(this).closest(".each-idea-container").attr("id");
            itemManager.findID(id).editItemName(text);
        }
    });

    itemsMasterContainer.on("keyup", ".editable-aisle", function(key) {
        if (key.which === 13) {
            var text = $(this).closest("h3").text();
            var id = $(this).closest(".each-idea-container").attr("id");
            itemManager.findID(id).editItemAisle(text);
        }
    });

    itemsMasterContainer.on("keyup", ".note", function(key) {
        if (key.which === 13) {
            var text = $(this).closest("h4").text();
            var id = $(this).closest(".each-idea-container").attr("id");
            itemManager.findID(id).editItemNote(text);
        }
    });

    itemsMasterContainer.on("keyup", ".quantity", function(key) {
        if (key.which === 13) {
            var text = $(this).closest("h5").text();
            var id = $(this).closest(".each-idea-container").attr("id");
            itemManager.findID(id).editItemQuantity(text);
        }
    });

    itemsMasterContainer.on("click", ".delete-button", function() {
        let that = this;
        let confirmDelete = confirm("Are you sure you want to delete the item?");
        if (confirmDelete) {
            var id = $(that).closest(".each-idea-container").attr("id");
            itemManager.remove(id);
        }
    });

    category.on("change", function() {
        assignAisle();
    });

    deleteAllItemsButton.on("click", function() {
        let confirmDelete = confirm("Warning! You are about to delete ALL your items! This cannot be undone!");
        if (confirmDelete) {
            itemManager.deleteAllItems();
        }
    }); // end of deleteAllItemsButton function

    function addUserInputToProgram() {
        var newItem = itemInput.val();
        var newAisle = aisleInput.val();
        var newNote = note.val();
        var newQuantity = quantity.val();
        itemManager.add(newItem, newAisle, newNote, newQuantity);
    }

    function clearInputFields() {
        itemInput.val("");
        aisleInput.val("");
        note.val("");
        quantity.val("");
        category.val("Please choose a category.");
    }

    itemManager.retrieve();
    itemManager.render();
    itemManager.count();

    function assignAisle() {

        let chosenCategory = category.val();

        let selectedAisle;
        let optionalNote;

        if (chosenCategory === "Bakery") {
            selectedAisle = "";
            optionalNote = "Bakery Section";
        } else if (chosenCategory === "Bottled Water") {
            selectedAisle = 20;
        } else if (chosenCategory === "Breads/PBJ/Honey") {
            selectedAisle = 13;
        } else if (chosenCategory === "Canned Beans/Tomatoes/Soups") {
            selectedAisle = 7;
        } else if (chosenCategory === "Canned Fish/Ethnic Foods/Pasta+Pasta Sauce/Rice") {
            selectedAisle = 6;
        } else if (chosenCategory === "Checkout") {
            selectedAisle = "";
            optionalNote = "At checkout";
        } else if (chosenCategory === "Chips/Nuts") {
            selectedAisle = 19;
        } else if (chosenCategory === "Cooking Wines/Condiments/Olives") {
            selectedAisle = 2;
        } else if (chosenCategory === "Deli/Prepared Foods") {
            selectedAisle = "";
            optionalNote = "Deli";
        } else if (chosenCategory === "Dish+Laundry Detergent") {
            selectedAisle = 9;
        } else if (chosenCategory === "Frozen Items") {
            selectedAisle = 11;
            optionalNote = "Or aisle 12";
        } else if (chosenCategory === "Household Goods") {
            selectedAisle = 8;
            optionalNote = "Or aisle 9";
        } else if (chosenCategory === "Meat") {
            selectedAisle = "";
            optionalNote = "Meat Section";
        } else if (chosenCategory === "Medicines (OTC)") {
            selectedAisle = 18;
        } else if (chosenCategory === "Office Supplies") {
            selectedAisle = 16;
        } else if (chosenCategory === "Personal Care Items") {
            selectedAisle = 17;
            optionalNote = "Or aisle 18";
        } else if (chosenCategory === "Pest Control") {
            selectedAisle = "";
            optionalNote = "Front of Store";
        } else if (chosenCategory === "Produce") {
            selectedAisle = "";
            optionalNote = "Produce Section";
        } else if (chosenCategory === "Soda") {
            selectedAisle = 22;
        } else if (chosenCategory === "Spices and Baking Items") {
            selectedAisle = 5;
        }

        aisleInput.val(selectedAisle);
        note.val(optionalNote);

    } //end of assignAisle

}); //end of jQuery body