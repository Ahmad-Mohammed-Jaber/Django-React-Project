import weatherApi from "./weatherApi.js"

weatherApi.get("/weather", { params: { q: "Amman" } })
  .then(res => console.log(res.data));
