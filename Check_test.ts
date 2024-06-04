import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { isData } from "./Check.ts";
import { isResult } from "./Check.ts";
import { emptyCommand, emptyCommandMeta, emptyContext, emptyData } from "./command/Empty.ts";
import { CommandData, CommandResult } from "./command/CommandDefinition.ts";

function pass(f: (x: unknown) => unknown, value: unknown) {
    assertEquals(f(value), value);
}

function fail(f: (x: unknown) => unknown, value: unknown) {
    try {
        f(value);
        assertEquals(true, false);
    } catch (e) {
        assertEquals(true, true);
    }
}

Deno.test("None of these are command data", () => {
    const f = isData;
    fail(f, "first");
    fail(f, {});
    fail(f, emptyCommand);
    fail(f, emptyCommandMeta);
    fail(f, emptyContext);
    fail(f, {fortran:"lang", content:"happy"});
    fail(f, {format:"lang", conscent:"happy"});
});

Deno.test("All of these are command data", () => {
    const f = isData;
    pass(f,emptyData);
    const data: CommandData = {format:'type', content:'checked'}
    pass(f, data);
    pass(f, {format:'string', content:'stuff'});
});

Deno.test("None of these are command results", () => {
    const f = isResult;
    fail(f, "first");
    fail(f, {});
    fail(f, emptyData);
    fail(f, emptyCommand);
    fail(f, emptyCommandMeta);
    fail(f, emptyContext);
});

Deno.test("All of these are command results", () => {
    const f = isResult;
    const commands = {};
    const output = emptyData;
    const result: CommandResult = {commands,output};
    pass(f, result);
    pass(f, {commands, output: {format:'floormat', content:'creator'}});
});
