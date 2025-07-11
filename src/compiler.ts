import * as ts from "typescript";

export default class Compiler {
  private readonly program: ts.Program;
  private readonly sourceFile: ts.SourceFile;

  constructor(srcFile: string, tsCompilerOptions: ts.CompilerOptions) {
    this.program = ts.createProgram([srcFile], tsCompilerOptions);
    const sourceFile = this.program.getSourceFile(srcFile);

    if (!sourceFile) {
      throw new Error("sourceFile not found");
    }

    this.sourceFile = sourceFile;
  }

  validate() {
    this.traverseAST(
      this.sourceFile,
      this.sourceFile,
      (node: ts.Node, sourceFile: ts.SourceFile) => {
        this.validateNonEmptyString(node, sourceFile);
      }
    );
  }

  // poc only. really need to refactor
  private validateNonEmptyString(node: ts.Node, sourceFile: ts.SourceFile) {
    if (node.kind !== ts.SyntaxKind.SourceFile) {
      if (node.kind === ts.SyntaxKind.VariableDeclaration) {
        const typeRef = node
          .getChildren(sourceFile)
          .find((c) => c.kind === ts.SyntaxKind.TypeReference);

        const typeName = typeRef?.getText(sourceFile);

        if (typeName === "NonEmptyString") {
          const value = node
            .getChildren(sourceFile)
            .find((c) => c.kind === ts.SyntaxKind.StringLiteral);

          const valueAsText = value?.getText(sourceFile).replace(/"|'/g, "");

          if (!valueAsText?.length) {
            throw new Error("String cannot be empty");
          }
        }
      }
    }
  }

  private traverseAST(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    handleNode: (node: ts.Node, sourceFile: ts.SourceFile) => void
  ) {
    handleNode(node, sourceFile);

    node.forEachChild((child) =>
      this.traverseAST(child, sourceFile, handleNode)
    );
  }
}
