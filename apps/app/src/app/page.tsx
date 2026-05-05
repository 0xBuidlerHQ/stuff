import { redirect } from "next/navigation";
import { links } from "@/config/links";

const Homepage = () => redirect(links.stuffs.url);

export default Homepage;
