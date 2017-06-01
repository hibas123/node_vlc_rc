# node_vlc_rc
NodeJS Binding for the VLC Media Player remote control

## Example
### Create a new VLC instance
```javascript
var VLC_RC = require('vlc_rc').VLC_RC;
var VLC = new VLC_RC();
```

You can pass options too:

```javascript
var VLC = new VLC_RC({verbose: true});
```
**Available Settings**
* *verbose* (Boolean): `true` or `false`, display verbose information
* *debug* (Boolean): `true` or `false`, pipe VLC-Output to console