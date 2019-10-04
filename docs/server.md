<a name="AlgoServer"></a>

## AlgoServer
Honey Framework Algorithmic Order Server

**Kind**: global class  

* [AlgoServer](#AlgoServer)
    * [new AlgoServer(args)](#new_AlgoServer_new)
    * [.open()](#AlgoServer+open)
    * [.close()](#AlgoServer+close)
    * [.clearAlgoHost()](#AlgoServer+clearAlgoHost)
    * [.setAlgoHost(aoHost)](#AlgoServer+setAlgoHost)

<a name="new_AlgoServer_new"></a>

### new AlgoServer(args)

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | passed to internal AO host |
| args.db | <code>Object</code> | bfx-hf-models DB instance |
| args.adapter | <code>AOAdapter</code> | exchange API adapter instance |
| args.aos | <code>Array.&lt;Object&gt;</code> | algorithmic order definitions |
| args.port | <code>number</code> | websocket server port |

<a name="AlgoServer+open"></a>

### algoServer.open()
Starts the WebSocket API server and opens the exchange connection.
If the API server has already been started, an error is thrown.

**Kind**: instance method of [<code>AlgoServer</code>](#AlgoServer)  
<a name="AlgoServer+close"></a>

### algoServer.close()
Closes both the WebSocket API server and the exchange connection.
If the API server is already closed, an error is thrown.

**Kind**: instance method of [<code>AlgoServer</code>](#AlgoServer)  
<a name="AlgoServer+clearAlgoHost"></a>

### algoServer.clearAlgoHost()
Removes all of the event bindings from the current established algo host
before calling for the algo host object to be closed. If there is no host
established then this function is a no-op.

**Kind**: instance method of [<code>AlgoServer</code>](#AlgoServer)  
<a name="AlgoServer+setAlgoHost"></a>

### algoServer.setAlgoHost(aoHost)
Sets the event bindings to use the given algo host instance. This function
also manages the closing of the old host instance and the establishment of
the new host instance.

If the WebSocket API server is running, the exchange connection is opened.

**Kind**: instance method of [<code>AlgoServer</code>](#AlgoServer)  

| Param | Type |
| --- | --- |
| aoHost | <code>Object</code> | 

