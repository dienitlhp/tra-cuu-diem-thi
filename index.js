import axios from "axios";
import fs from "fs";
import { exit } from "process";
import { load } from "cheerio";
import { STUDENT_IDS } from "./constants.js";

// URL = https://namdinh.edu.vn/tra-cuu/diem-thi-thpt-chuyen-le-hong-phong

const getByStudentId = async (id) => {
  const postData = {
    layout: "Decl.DataSet.Detail.default",
    itemsPerPage: "1000",
    pageNo: "1",
    service: "Content.Decl.DataSet.Grouping.select",
    itemId: "629223dd76db8ccf7a0166a4", // Id các năm
    gridModuleParentId: "14",
    type: "Decl.DataSet",
    page: "",
    modulePosition: "0",
    moduleParentId: "-1",
    orderBy: "",
    unRegex: "",
    keyword: id,
    _t: "1687765797",
  };
  const res = await axios.post(
    "https://namdinh.edu.vn/?module=Content.Listing&moduleId=1014&cmd=redraw&site=19012&url_mode=rewrite&submitFormId=1014&moduleId=1014&page=&site=19012",
    postData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const $ = load(res.data);
  const thead = $("thead tr th")
    .get()
    .map((item) => item.children[0].data);
  let tbody = [];
  $("tbody tr td")
    .get()
    .forEach((item) => item?.children[0]?.data && tbody.push(item.children[0].data));
  $(".formNumberInput")
    .get()
    .forEach((item) => tbody.push(item.children[0].data));
  let result = {};
  thead.forEach((key, i) => (result[key] = tbody[i]?.trim()));
  return result;
};

Promise.all(STUDENT_IDS.map((id) => getByStudentId(id))).then((e) => {
  fs.writeFile("result.json", JSON.stringify(e), function (err) {
    if (err) throw err;
    console.log("Done!");
    exit();
  });
});
