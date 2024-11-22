import { createRoot } from "react-dom/client";
import React from "react";
import {Application} from "./application";

const mountPoint = document.getElementById("app");
const root = createRoot(mountPoint);

root.render(<Application />)