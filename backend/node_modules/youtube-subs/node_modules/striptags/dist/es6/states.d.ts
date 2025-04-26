declare type QuoteCharacter = '"' | "'";
export interface StateMachineOptions {
    readonly allowedTags?: Set<string>;
    readonly disallowedTags?: Set<string>;
    readonly tagReplacementText: string;
    readonly encodePlaintextTagDelimiters: boolean;
}
export declare type StateTransitionFunction = (next: State) => void;
export interface State {
    consume(character: string, transition: StateTransitionFunction): string;
}
declare type InPlaintextStateTransitionFunction = (next: InTagNameState) => void;
export declare class InPlaintextState implements State {
    private readonly options;
    constructor(options: StateMachineOptions);
    consume(character: string, transition: InPlaintextStateTransitionFunction): string;
}
export declare const enum TagMode {
    Allowed = 0,
    Disallowed = 1
}
declare type InTagNameStateTransitionFunction = (next: InPlaintextState | InTagState<TagMode.Allowed> | InTagState<TagMode.Disallowed> | InCommentState) => void;
export declare class InTagNameState implements State {
    private readonly options;
    private nameBuffer;
    private isClosingTag;
    constructor(options: StateMachineOptions);
    consume(character: string, transition: InTagNameStateTransitionFunction): string;
    private isNameBufferAnAllowedTag;
}
declare type InTagStateTransitionFunction<T extends TagMode> = (next: InPlaintextState | InQuotedStringInTagState<T>) => void;
export declare class InTagState<T extends TagMode> implements State {
    readonly mode: T;
    private readonly options;
    constructor(mode: T, options: StateMachineOptions);
    consume(character: string, transition: InTagStateTransitionFunction<T>): string;
}
declare type InQuotedStringInTagStateTransitionFunction<T extends TagMode> = (next: InTagState<T>) => void;
export declare class InQuotedStringInTagState<T extends TagMode> implements State {
    readonly mode: T;
    readonly quoteCharacter: QuoteCharacter;
    private readonly options;
    constructor(mode: T, quoteCharacter: QuoteCharacter, options: StateMachineOptions);
    consume(character: string, transition: InQuotedStringInTagStateTransitionFunction<T>): string;
}
declare type InCommentStateTransitionFunction = (next: InPlaintextState) => void;
export declare class InCommentState implements State {
    private readonly options;
    private consecutiveHyphens;
    constructor(options: StateMachineOptions);
    consume(character: string, transition: InCommentStateTransitionFunction): string;
}
export {};
