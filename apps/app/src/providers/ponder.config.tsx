import * as ponderSchema from "@0xhq/stuff.subgraph";
import { createClient } from "@ponder/client";

const ponderClient = createClient("http://localhost:8000/sql", { schema: ponderSchema });

export { ponderClient, ponderSchema };
