<template>
<v-row justify="center">
    <v-btn color="primary" dark @click.stop="dialog = true">
        Open Dialog
    </v-btn>

    <v-dialog v-model="$store.state.fileUploadDialog">
        <v-card>
            <v-card-title class="headline">Upload Files</v-card-title>
            <v-card-text>
                <file-upload ref="upload" v-model="files" @input-file="inputFile" @input-filter="inputFilter">
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" text @click="close">
                    Close
                </v-btn>

                <v-btn color="green darken-1" text @click="$store.state.fileUploadDialog">
                    Upload
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</v-row>
</template>

<script>
export default {
    data() {
        return {
            dialog: false,
            files: []
        }
    },
    methods: {
        close() {

            this.$store.state.fileUploadDialog = false;
        },
        /**
         * Pretreatment
         * @param  Object|undefined   newFile   Read and write
         * @param  Object|undefined   oldFile   Read only
         * @param  Function           prevent   Prevent changing
         * @return undefined
         */
        inputFilter: function (newFile, oldFile, prevent) {
            if (newFile && !oldFile) {
                // Filter non-image file
                if (!/\.(jpeg|jpe|jpg|gif|png|webp)$/i.test(newFile.name)) {
                    return prevent()
                }
            }

            // Create a blob field
            newFile.blob = ''
            let URL = window.URL || window.webkitURL
            if (URL && URL.createObjectURL) {
                newFile.blob = URL.createObjectURL(newFile.file)
            }
        },
        /**
         * Has changed
         * @param  Object|undefined   newFile   Read only
         * @param  Object|undefined   oldFile   Read only
         * @return undefined
         */
        inputFile: function (newFile, oldFile) {
            if (newFile && oldFile && !newFile.active && oldFile.active) {
                // Get response data
                console.log('response', newFile.response)
                if (newFile.xhr) {
                    //  Get the response status code
                    console.log('status', newFile.xhr.status)
                }
            }
        }
    }

}
}
</script>
