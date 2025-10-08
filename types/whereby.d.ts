declare namespace JSX {
  interface IntrinsicElements {
    'whereby-embed': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        room: string
        displayName?: string
        minimal?: 'off' | 'on'
        background?: 'off' | 'on'
        chat?: 'off' | 'on'
        people?: 'off' | 'on'
        screenshare?: 'off' | 'on'
        video?: 'off' | 'on'
        audio?: 'off' | 'on'
        leaveButton?: 'hide' | 'show'
        floatSelf?: boolean
        cameraEffect?: string
        lang?: string
        style?: React.CSSProperties
      },
      HTMLElement
    >
  }
}
