'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { writeFileSync } from 'fs';

function getSelection(editor: vscode.TextEditor) {
    let selection = editor.selection;
    if (selection.isEmpty) {
        vscode.window.showErrorMessage("You need a selection");
        return;
    }

    return selection;
}

function removeSelection(editor: vscode.TextEditor, range: vscode.Range) {
    const edit = new vscode.WorkspaceEdit();
    if (edit) {
        edit.delete(editor.document.uri, range);
        vscode.workspace.applyEdit(edit);
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.extractToFile', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        let selection = getSelection(editor);
        if (!selection) {
            return;
        }

        let range = new vscode.Range(selection.start, selection.end);

        let text = editor.document.getText(selection);

        let folders = vscode.workspace.workspaceFolders;
        if (folders === undefined) {
            vscode.window.showErrorMessage("Please open a workspace folder");
            return;
        }

        vscode.window.showSaveDialog({
            defaultUri: folders[0].uri,
            saveLabel: "Create file to extract to"
        }).then((result) => {
            if (result === undefined) {
                vscode.window.showWarningMessage("No file selected");
                return;
            }
            writeFileSync(result.path, text, "utf8");

            if (editor) {
                removeSelection(editor, range);
            }

            vscode.workspace.openTextDocument(vscode.Uri.file(result.path)).then((doc) => {
                vscode.window.showTextDocument(doc);
            });
        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
