<template>
    <div id="main-wraper" class="full">
         <Layout class="full">
            <Sider hide-trigger>Sider</Sider>
            <Layout>
                <Header>Header</Header>
                <Content>
                    <router-view></router-view>
                </Content>
            </Layout>
        </Layout>
    </div>
</template>

<script>
    export default {
        
    }
</script>

<style scoped>
    #main-wraper{
        position: relative;
    }
</style>