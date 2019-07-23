function fetchAccessToken(handler) {

    // We use jQuery to make an Ajax request to our server to retrieve our 
    // Access Token
    $.getJSON('/token', function (data) {
        console.log('token handler called')
        syncClient = new Twilio.Sync.Client(tokenResponse.token, { logLevel: 'debug' });
        syncClient.on('connectionStateChanged', function (state) {
            if (state != 'connected') {
                console.log('Sync is not live (websocket connection <span style="color: red">' + state + '</span>)…');
            } else {
                // Now that we're connected, lets light up our board and play!
                console.log('Sync is live!');
            }
        });


    });

}
function initializeSync(tokenResponse) {
    var syncClient = new Twilio.Sync.Client(tokenResponse.token);

    syncClient.map('customer_orders').then(function (map) {
        map.getItems().then(function (order) {
            console.log('show first item', order.customer_order.id,
                rder.customer_order.data.order);
        });
    });

    //     let orders =  {{{orders}}}; 

    // orders.forEach(function(order) {    

    //     var contents = "<h1>Customer Order: " + order.customer_order.id +"</h1><p>Name: "+ order.customer_order.data.customer 
    //         + "</p>" + "<p>Order: " + order.customer_order.data.order + "</p>" +"<p>Epic: "+ order.customer_order.data.epic + "</p>" ;


    //     temp = document.createElement('div');
    //     temp.className = 'orders';
    //     temp.innerHTML = contents;


    //     document.getElementsByTagName('body')[0].appendChild(temp)

}

fetchAccessToken(initializeSync);