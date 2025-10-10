export type Answer = {
    text: string;
    type: string;
    children?: Answer[];
}

export type Question = {
    title: string;
    answers: Answer[];
}

export type Topics = {
    title: string;
    questions: Question[];
}

