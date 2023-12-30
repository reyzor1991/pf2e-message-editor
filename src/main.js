const moduleName = "pf2e-message-editor"

class MessageEditor extends FormApplication {

    constructor(options) {
        super();
        this.message = options.message;
    }

    async getData() {
        const rollData = { ...this.message?.item?.getRollData(), ...this.message?.actor?.getRollData() };

        return mergeObject(super.getData(), {
            content: await TextEditor.enrichHTML((this.message.flavor ? this.message.flavor : this.message.content), {
                rollData,
                secrets: this.message.isOwner,
            }),
            editable: this.isEditable,
            owner: this.message.isOwner,
        });
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: "Message Editor",
            id: `${moduleName}`,
            classes: [moduleName],
            template: "modules/pf2e-message-editor/templates/message.hbs",
            width: 500,
            height: "auto",
            resizable: true,
        });
    }

    async _updateObject(_event, data) {
        let fieldName = this.message.flavor ? 'flavor' : 'content'
        await this.message.update({
            [fieldName]: data.content,
            timestamp: Date.now()
        })
    }

    activateListeners($html) {
        super.activateListeners($html);
    }
}

Hooks.on("renderChatMessage", async (message, html) => {
    if (!game.user.isGM) {return}
    html.find('.message-metadata .message-delete').before(`<a aria-label="Edit" class="message-edit"><i class="fas fa-edit"></i></a>`)

    html.on('click', '.message-metadata .message-edit', function() {
        new MessageEditor({message}).render(true)
    })
})

Hooks.on("init", () => {
    const module = game.modules.get(moduleName)
    module.api = {
        form: {
            MessageEditor,
        },
    }
});