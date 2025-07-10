const moduleName = "pf2e-message-editor"

class MessageEditor extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
) {

    static DEFAULT_OPTIONS = {
        id: `${moduleName}`,
        tag: 'form',
        form: {
            handler: MessageEditor.formHandler,
            submitOnChange: true
        },
        actions: {},
        position: {
            height: 270,
            width: 350
        },
        window: {
            icon: 'fas fa-note-sticky',
            resizable: true
        },
        classes: [moduleName],
    };

    static PARTS = {
        form: {
            template: `modules/pf2e-message-editor/templates/message.hbs`,
            scrollable: [".scrollable"]
        }
    };

    get title() {
        return `Message Editor`;
    }

    constructor(options) {
        super();
        this.message = options.message;
    }

    static async formHandler(event, form, formData) {
        let fieldName = this.message.flavor ? 'flavor' : 'content'
        await this.message.update({
            [fieldName]: formData.object.content,
            timestamp: Date.now()
        })
        await this.render()
    }

    async _prepareContext(options) {
        const rollData = {...this.message?.item?.getRollData(), ...this.message?.actor?.getRollData()};

        return {
            enrichedContent: await foundry.applications.ux.TextEditor.implementation.enrichHTML((this.message.flavor ? this.message.flavor : this.message.content), {
                rollData,
                secrets: this.message.isOwner,
                relativeTo: this.message,
            }),
            content: this.message.flavor ? this.message.flavor : this.message.content,
            editable: this.message.isOwner,
            owner: this.message.isOwner,
            documenUuid: this.message.uuid,
        };
    }
}

Hooks.on("renderChatMessageHTML", async (message, html) => {
    if (!game.user.isGM) {
        return
    }
    let btn = foundry.utils.parseHTML( `<a aria-label="Edit" class="message-edit"><i class="fas fa-edit"></i></a>`);
    btn.addEventListener('click', function () {
        new MessageEditor({message}).render(true)
    })
    html.querySelector('.message-metadata .message-delete')
        ?.before(btn)

})

Hooks.on("init", () => {
    const module = game.modules.get(moduleName)
    module.api = {
        form: {
            MessageEditor,
        },
    }
});