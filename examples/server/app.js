import express from "express";
import path from "path";
import ejs from "ejs";

const app = express();
const PORT = 3000;

app.use(express.static(path.join(".", "public")));
app.engine("ejs", ejs.__express);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("dsnpExample", {
    title: "DSNP SDK Example",
    port: PORT,
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
