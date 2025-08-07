import type { Snippet } from 'svelte';
interface PropsInterface {
    open: boolean;
    onClose: () => void;
    prepend?: Snippet;
    children: Snippet;
    append?: Snippet;
    title: string;
}
declare const Modal: import("svelte").Component<PropsInterface, {}, "">;
type Modal = ReturnType<typeof Modal>;
export default Modal;
