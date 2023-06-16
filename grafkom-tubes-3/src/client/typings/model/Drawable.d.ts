interface DrawableModel {
    vertices: number[];
    colors: number[];
    indices: number[];
    uv: number[];
}

interface DrawableTreeHierarchy {
    name: string;
    transform: number[];
    render: DrawableModel;
    animation: DrawableAnimation;
    joint: JointAngle;
    children: DrawableTreeHierarchy[];
}

interface DrawableAnimation {
    axAbs?: boolean;
    ax: number;
    fx: number;
    ayAbs?: boolean;
    ay: number;
    fy: number;
    azAbs?: boolean;
    az: number;
    fz: number;
}

interface JointAngle {
    axAbs?: boolean;
    ax: number;
    ayAbs?: boolean;
    ay: number;
    azAbs?: boolean;
    az: number;
}
