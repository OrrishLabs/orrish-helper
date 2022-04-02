function ConditionalWrapper(props: any) {
    return props.condition ? props.wrapper(props.children) : props.children;
}

export default ConditionalWrapper;
