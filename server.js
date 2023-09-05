require('./models')
const app = require('./app');

// launch our backend into a port
app.listen(process.env.PORT || "3001", () => console.log(`LISTENING ON PORT 3001`));
