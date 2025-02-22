export interface Provider {
    auditResults: null | AuditResults,
    userProjects: null | Array<Project>,
    userToken: null | string,
    activeProject: null | Project,
    actions: {
        setAuditResults: (value: any) => void;
        setUserProjects: (value: any) => void;
        setUserToken: (value: any) => void;
        setActiveProject: (value: any) => void;
    }
}

export type Project = {
    id: number
    inserted_at: string,
    name: string,
    updated_at: string,
    uuid: string,
    issues: Array<Issue>
    members: Array<Member>
}

export type Issue = {
    id: number,
    inserted_at: string,
    matches: Array<Match>,
    matches_count: number,
    project_id: number,
    status: string,
    updated_at: string,
    user_id: number,
    uuid: string,
}

export type Member = {
    id: number,
    uuid: string,
    role: string,
    inserted_at: string,
    username: string
}


export type AuditResults = {
    html: string,
    matches: Array<Match>,
    numberOfErrors: number,
    success: boolean
}

export type Match = {
    content: string,
    contentWithIdentifier: string,
    dataAttributeId: number,
    description: string,
    fixable: boolean,
    heading: string,
    identifier: string,
    issue: string,
    lineIndex: number,
    url: string,
    wcag: string,
    wcagClass: string
}

// You can put this in your ProjectsPanel.tsx or in a separate types file

export interface WebviewState {
    activeProject?: string;
}