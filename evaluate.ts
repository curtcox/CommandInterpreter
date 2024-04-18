const evaluate = (expression: string): any => {
    try {
      return eval(expression);
    } catch (error) {
      console.error(`Error evaluating expression: ${error.message}`);
      Deno.exit(1);
    }
  };
  
  export default evaluate;