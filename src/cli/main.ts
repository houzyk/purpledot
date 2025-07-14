import { Command } from "commander";

const program = new Command();

program.name("purpledot").version("1.0.0");

program.command("compile").argument("<file>");

program.parse();
