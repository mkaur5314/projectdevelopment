/* 
  Author : Manpreet Kaur 
  Student ID: 8735314
*/
const Order = require("./Order");

const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  SIZE: Symbol("size"),
  TOPPINGS: Symbol("toppings"),
  SAUCE: Symbol("sauce"),
  SALAD: Symbol("salad"),
  QUANTITY: Symbol("quantity"),
  PAYMENT: Symbol("payment")
});

module.exports = class SubwayOrder extends Order {
  constructor(sNumber, sUrl) {
    super(sNumber, sUrl);
    this.stateCur = OrderState.WELCOMING;
    this.sSize = "";
    this.sToppings = "";
    this.sSauce = "";
    this.sSalad = "";
    this.sItem = "sub";
    this.sPrice = 10;
    this.sQuantity = "";
    this.sSaucePrice = 0;
  }
  handleInput(sInput) {
    let aReturn = [];
    switch (this.stateCur) {
      case OrderState.WELCOMING:
        this.stateCur = OrderState.SIZE
        aReturn.push("Welcome to Subway.");
        aReturn.push("What size would you like?(small/large)");
        break;
      case OrderState.SIZE:
        this.sSize = sInput;
        if (this.sSize == "small" || this.sSize == "large") {
          this.stateCur = OrderState.TOPPINGS
          if (this.sSize == "small") {
            this.sPrice += 8;
          }
          if (this.sSize == "large") {
            this.sPrice += 12;
          }
          aReturn.push("What toppings would you like?");
        }
        else {
          aReturn.push("Please enter valid Size(small/large)");
          this.stateCur = OrderState.SIZE
        }
        break;
      case OrderState.TOPPINGS:
        this.stateCur = OrderState.SAUCE
        this.sToppings = sInput;
        aReturn.push("Which sauce would you like?(mayo/bbq/sweet onion)");
        break;
      case OrderState.SAUCE:
        this.sSauce = sInput;
        if (this.sSauce == "mayo" || this.sSauce == "bbq" || this.sSauce == "sweet onion") {
          this.stateCur = OrderState.QUANTITY
          if (this.sSauce == "mayo") {
            this.sSaucePrice = 1;
          }
          if (this.sSauce = "bbq") {
            this.sSaucePrice = 5;
          }
          if (this.sSauce == "sweet onion") {
            this.sSaucePrice = 3;
          }
          aReturn.push("How many Sauces you want?");
        }
        else {
          aReturn.push("Please select from avilable sauce (mayo, bbq and sweet onion)");
          this.stateCur = OrderState.SAUCE
        }
        break;
      case OrderState.QUANTITY:
        this.sQuantity = sInput;
        if (!isNaN(sInput)) {
          this.stateCur = OrderState.SALAD
          this.sPrice += this.sSaucePrice * parseInt(sInput);
          aReturn.push("Would you like Salad along with that?");
        }
        else {
          aReturn.push("Please enter valid integer");
          this.stateCur = OrderState.QUANTITY
        }
        break;
      case OrderState.SALAD:
        this.sSalad = sInput;
        if (sInput.toLowerCase() == "no" || sInput.toLowerCase() == "yes") {
          this.stateCur = OrderState.PAYMENT
          if (sInput.toLowerCase() != "no") {
            this.sPrice += 10;
          }

          aReturn.push("Thank-you for your order of");
          aReturn.push(`${this.sSize} ${this.sItem} with ${this.sToppings} and ${this.sSauce} Sauce `);
          if (this.sSalad) {
            aReturn.push(`and Salad`);
          }
          aReturn.push(`Your Total Amount is $${this.sPrice}`)
          aReturn.push(`Please pay for your order here(Click on the payment link below)`);
          aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
        }
        else {
          aReturn.push("Please enter valid option");
          this.stateCur = OrderState.SALAD
        }
        break;
      case OrderState.PAYMENT:
        this.isDone(true);
        let d = new Date();
        d.setMinutes(d.getMinutes() + 20);
        aReturn.push(`Your order will be ready at ${d.toTimeString()}`);
        aReturn.push(`Your order will be deliverd at ${sInput.address_line_1} , ${sInput.admin_area_2}, ${sInput.admin_area_1}, ${sInput.postal_code}, ${sInput.country_code}.`)
        break;
    }
    return aReturn;
  }
  renderForm() {
    // your client id should be kept private
    const sClientID = process.env.SB_CLIENT_ID || 'AXILLxWTyLOGvcYZDfXbMxvyllLF7HxVLKHHLoBFoGZN5QxqkITYqHSYw6Cgnw-bnXLwq_YiSVScdMjI'
    return (`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your order of $${this.sPrice} CAD.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.sPrice}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);

  }
}