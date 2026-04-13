import axios from "axios";
import { BACKEND_HTTP_TIMEOUT_MS, HTTP_MAX_REDIRECTS } from "consts";

export default axios.create({
  timeout: BACKEND_HTTP_TIMEOUT_MS,
  maxRedirects: HTTP_MAX_REDIRECTS,
});
