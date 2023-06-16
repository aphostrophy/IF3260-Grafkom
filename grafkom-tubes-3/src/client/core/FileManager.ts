import AppState from '@core/AppState';
import Drawable from './Drawable';

class FileManager {
    constructor() {}

    saveAppState(appState: AppState) {
        const rootModel: Drawable = appState.rootModel;
        const saveObj: DrawableTreeHierarchy = {
            transform: rootModel.matrixWorld.toArray(),
            render: {
                vertices: rootModel.vertices,
                uv: rootModel.uv,
                colors: rootModel.rawColors,
                indices: rootModel.indices,
            },
            name: rootModel.name,
            animation: rootModel.animation,
            joint: rootModel.joint,
            children: [],
        };
        const stack: Drawable[] = [];
        const logicalStack: DrawableTreeHierarchy[] = [];
        stack.push(rootModel);
        logicalStack.push(saveObj);
        while (stack.length > 0) {
            const currNode = stack.pop()!;
            const currLogicalNode = logicalStack.pop()!;
            currNode.children.forEach((nextNode) => {
                const nextLogicalDrawableTreeHierarchy: DrawableTreeHierarchy = {
                    transform: nextNode.matrixWorld.toArray(),
                    render: {
                        vertices: nextNode.vertices,
                        uv: nextNode.uv,
                        colors: nextNode.rawColors,
                        indices: nextNode.indices,
                    },
                    name: nextNode.name,
                    animation: nextNode.animation,
                    joint: nextNode.joint,
                    children: [],
                };
                currLogicalNode.children.push(nextLogicalDrawableTreeHierarchy);
                stack.push(nextNode);
                logicalStack.push(nextLogicalDrawableTreeHierarchy);
            });
        }

        this.download(JSON.stringify(saveObj), 'aphos-WEBGL-state.json', 'application/json');
    }

    private download(data: string, fileName: string, contentType: string): void {
        const file = new Blob([data], { type: contentType });
        const a = document.createElement('a');
        const url = URL.createObjectURL(file);
        a.href = url;
        a.download = fileName;
        a.click();
        (async () => {
            window.URL.revokeObjectURL(url);
        })();
    }
}

export { FileManager };
